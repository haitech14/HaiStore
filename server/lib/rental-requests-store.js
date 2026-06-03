import { randomUUID } from 'crypto';

import { shouldUseSharedSupabaseData } from './data-source.js';
import {
  ensureStoreCustomerFromHaitechClient,
  upsertHaiSupportRentalRequest,
  deleteHaiSupportRentalRequest,
} from './haisupport-bridge.js';
import { notifyHaiSupportChange } from './haisupport-sync.js';
import { inboundPayloadToHaitechClient } from './haitech-mappers.js';
import { readRentalPlansFromSupabase } from './rental-plans-store.js';
import { getSupabaseAdmin } from './supabase-auth.js';

const VALID_STATUS = new Set(['pending', 'quoted', 'active', 'ended', 'cancelled']);

function rowToRecord(row) {
  const snap = row.customer_snapshot && typeof row.customer_snapshot === 'object' ? row.customer_snapshot : {};
  return {
    id: row.id,
    code: row.code,
    clientId: row.client_id ?? null,
    planId: row.plan_id,
    planLabel: row.plan_label,
    productId: row.product_id ?? null,
    productName: row.product_name ?? null,
    haisupportRentalId: row.haisupport_rental_id ?? null,
    customerSnapshot: snap,
    pagesPerMonth: Number(row.pages_per_month) || 0,
    monthlyPricePen: Number(row.monthly_price_pen) || 0,
    startDate: row.start_date,
    status: row.status,
    notes: row.notes ?? null,
    source: row.source === 'haisupport' ? 'haisupport' : 'haistore',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function recordToRow(record) {
  return {
    id: record.id,
    code: record.code,
    client_id: record.clientId ?? null,
    plan_id: record.planId,
    plan_label: record.planLabel,
    product_id: record.productId ?? null,
    product_name: record.productName ?? null,
    haisupport_rental_id: record.haisupportRentalId ?? null,
    customer_snapshot: record.customerSnapshot,
    pages_per_month: record.pagesPerMonth,
    monthly_price_pen: record.monthlyPricePen,
    start_date: record.startDate,
    status: record.status,
    notes: record.notes ?? null,
    source: record.source ?? 'haistore',
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function generateCode() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `ALQ-${year}-${seq}`;
}

export async function readRentalRequests() {
  const supabase = getSupabaseAdmin();
  if (!shouldUseSharedSupabaseData() || !supabase) {
    return { requests: [] };
  }

  const { data, error } = await supabase
    .from('store_rental_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (/relation|schema cache|Could not find/i.test(error.message)) {
      console.warn('[rental-requests] tabla no disponible; ejecuta migración 008');
      return { requests: [] };
    }
    throw new Error('No se pudieron cargar solicitudes de alquiler');
  }

  return { requests: (data ?? []).map(rowToRecord) };
}

export async function saveRentalRequest(record, action = 'upsert') {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const normalized = recordToRow(record);
  const { error } = await supabase.from('store_rental_requests').upsert(normalized, { onConflict: 'id' });
  if (error) throw new Error('No se pudo guardar la solicitud de alquiler');

  const out = rowToRecord(normalized);
  const hsId = await upsertHaiSupportRentalRequest(out);
  if (hsId && hsId !== out.haisupportRentalId) {
    out.haisupportRentalId = hsId;
    await supabase
      .from('store_rental_requests')
      .update({ haisupport_rental_id: hsId, updated_at: new Date().toISOString() })
      .eq('id', out.id);
  }

  notifyHaiSupportChange('rental_requests', action, out);
  return out;
}

export async function removeRentalRequest(id, haisupportRentalId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const { error } = await supabase.from('store_rental_requests').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar la solicitud de alquiler');

  if (haisupportRentalId) await deleteHaiSupportRentalRequest(haisupportRentalId);
  notifyHaiSupportChange('rental_requests', 'delete', { id, haisupportRentalId });
}

export async function createRentalRequestFromBody(body) {
  const customer = inboundPayloadToHaitechClient(body.customer ?? {});
  const { clientId, haisupportClientId, snapshot } = await ensureStoreCustomerFromHaitechClient(customer);

  if (!body.planId) throw new Error('El plan de alquiler es obligatorio');
  const startDate = body.startDate ?? body.start_date;
  if (!startDate) throw new Error('La fecha de inicio es obligatoria');

  const plans = await readRentalPlansFromSupabase();
  const plan = (plans ?? []).find((p) => p.id === body.planId);
  if (!plan) throw new Error('Plan de alquiler no encontrado');

  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    code: body.code ?? generateCode(),
    clientId,
    planId: plan.id,
    planLabel: plan.label,
    productId: body.productId ?? null,
    productName: body.productName ?? null,
    haisupportRentalId: null,
    customerSnapshot: { ...snapshot, storeCustomerId: clientId, haisupportClientId },
    pagesPerMonth: plan.pagesPerMonth,
    monthlyPricePen: plan.monthlyPricePen,
    startDate,
    status: VALID_STATUS.has(body.status) ? body.status : 'pending',
    notes: body.notes ?? null,
    source: 'haistore',
    createdAt: now,
    updatedAt: now,
  };

  return saveRentalRequest(record, 'create');
}

export async function patchRentalRequest(existing, body) {
  const next = { ...existing, updatedAt: new Date().toISOString() };
  if (body.status && VALID_STATUS.has(body.status)) next.status = body.status;
  if (body.notes !== undefined) next.notes = body.notes;
  if (body.customer) {
    const { snapshot, clientId } = await ensureStoreCustomerFromHaitechClient(body.customer);
    next.customerSnapshot = snapshot;
    next.clientId = clientId;
  }
  return saveRentalRequest(next, 'update');
}

export async function upsertRentalRequestFromInbound(payload) {
  const customer = inboundPayloadToHaitechClient(
    payload.customerSnapshot ?? payload.customer_snapshot ?? payload.customer ?? {},
  );

  const record = {
    id: payload.id ?? randomUUID(),
    code: payload.code ?? generateCode(),
    clientId: payload.clientId ?? payload.client_id ?? null,
    planId: payload.planId ?? payload.plan_id,
    planLabel: payload.planLabel ?? payload.plan_label ?? payload.planId,
    productId: payload.productId ?? payload.product_id ?? null,
    productName: payload.productName ?? payload.product_name ?? null,
    haisupportRentalId: payload.haisupportRentalId ?? payload.haisupport_rental_id ?? null,
    customerSnapshot: customer,
    pagesPerMonth: Number(payload.pagesPerMonth ?? payload.pages_per_month) || 0,
    monthlyPricePen: Number(payload.monthlyPricePen ?? payload.monthly_price_pen) || 0,
    startDate: payload.startDate ?? payload.start_date ?? new Date().toISOString().slice(0, 10),
    status: VALID_STATUS.has(payload.status) ? payload.status : 'pending',
    notes: payload.notes ?? null,
    source: 'haisupport',
    createdAt: payload.createdAt ?? payload.created_at ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('store_rental_requests').upsert(recordToRow(record), { onConflict: 'id' });
    if (error) throw new Error('No se pudo sincronizar solicitud de alquiler');
  }

  return rowToRecord(recordToRow(record));
}

export async function deleteRentalPlanFromSupabase(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { error } = await supabase.from('store_rental_plans').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar el plan de alquiler');
  return true;
}
