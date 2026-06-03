import { randomUUID } from 'crypto';

import { shouldUseSharedSupabaseData } from './data-source.js';
import { ensureStoreCustomerFromHaitechClient, upsertHaiSupportServiceRequest, deleteHaiSupportServiceRequest } from './haisupport-bridge.js';
import { notifyHaiSupportChange } from './haisupport-sync.js';
import { inboundPayloadToHaitechClient } from './haitech-mappers.js';
import { getSupabaseAdmin } from './supabase-auth.js';

const VALID_STATUS = new Set(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']);

function rowToRecord(row) {
  const snap = row.customer_snapshot && typeof row.customer_snapshot === 'object' ? row.customer_snapshot : {};
  return {
    id: row.id,
    code: row.code,
    clientId: row.client_id ?? null,
    haisupportRequestId: row.haisupport_request_id ?? null,
    customerSnapshot: snap,
    categoryId: row.category_id,
    categoryLabel: row.category_label,
    description: row.description,
    status: row.status,
    scheduledAt: row.scheduled_at,
    technician: row.technician ?? null,
    address: row.address ?? null,
    city: row.city ?? null,
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
    haisupport_request_id: record.haisupportRequestId ?? null,
    customer_snapshot: record.customerSnapshot,
    category_id: record.categoryId,
    category_label: record.categoryLabel,
    description: record.description,
    status: record.status,
    scheduled_at: record.scheduledAt,
    technician: record.technician ?? null,
    address: record.address ?? null,
    city: record.city ?? null,
    source: record.source ?? 'haistore',
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function generateCode() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `SV-${year}-${seq}`;
}

export async function readServiceRequests() {
  const supabase = getSupabaseAdmin();
  if (!shouldUseSharedSupabaseData() || !supabase) {
    return { requests: [] };
  }

  const { data, error } = await supabase
    .from('store_service_requests')
    .select('*')
    .order('scheduled_at', { ascending: false });

  if (error) {
    if (/relation|schema cache|Could not find/i.test(error.message)) {
      console.warn('[service-requests] tabla no disponible; ejecuta migración 008');
      return { requests: [] };
    }
    throw new Error('No se pudieron cargar solicitudes de servicio');
  }

  return { requests: (data ?? []).map(rowToRecord) };
}

export async function saveServiceRequest(record, action = 'upsert') {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const normalized = recordToRow(record);
  const { error } = await supabase.from('store_service_requests').upsert(normalized, { onConflict: 'id' });
  if (error) throw new Error('No se pudo guardar la solicitud de servicio');

  const out = rowToRecord(normalized);
  const hsId = await upsertHaiSupportServiceRequest(out);
  if (hsId && hsId !== out.haisupportRequestId) {
    out.haisupportRequestId = hsId;
    await supabase
      .from('store_service_requests')
      .update({ haisupport_request_id: hsId, updated_at: new Date().toISOString() })
      .eq('id', out.id);
  }

  notifyHaiSupportChange('service_requests', action, out);
  return out;
}

export async function removeServiceRequest(id, haisupportRequestId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const { error } = await supabase.from('store_service_requests').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar la solicitud');

  if (haisupportRequestId) await deleteHaiSupportServiceRequest(haisupportRequestId);
  notifyHaiSupportChange('service_requests', 'delete', { id, haisupportRequestId });
}

export async function createServiceRequestFromBody(body) {
  const customer = inboundPayloadToHaitechClient(body.customer ?? {});
  const { clientId, haisupportClientId, snapshot } = await ensureStoreCustomerFromHaitechClient(customer);

  const now = new Date().toISOString();
  const scheduledAt = body.scheduledAt ?? body.scheduled_at;
  if (!scheduledAt) throw new Error('La fecha programada es obligatoria');
  if (!body.categoryId) throw new Error('La categoría es obligatoria');
  if (!String(body.description ?? '').trim()) throw new Error('La descripción es obligatoria');

  const record = {
    id: randomUUID(),
    code: body.code ?? generateCode(),
    clientId,
    haisupportRequestId: null,
    customerSnapshot: { ...snapshot, storeCustomerId: clientId, haisupportClientId },
    categoryId: body.categoryId,
    categoryLabel: body.categoryLabel ?? body.category_label ?? body.categoryId,
    description: String(body.description).trim(),
    status: VALID_STATUS.has(body.status) ? body.status : 'pending',
    scheduledAt,
    technician: body.technician ?? null,
    address: body.address ?? snapshot.direccion ?? null,
    city: body.city ?? snapshot.ciudad ?? null,
    source: 'haistore',
    createdAt: now,
    updatedAt: now,
  };

  return saveServiceRequest(record, 'create');
}

export async function patchServiceRequest(existing, body) {
  const next = {
    ...existing,
    updatedAt: new Date().toISOString(),
  };

  if (body.status && VALID_STATUS.has(body.status)) next.status = body.status;
  if (body.description !== undefined) next.description = String(body.description).trim();
  if (body.scheduledAt !== undefined) next.scheduledAt = body.scheduledAt;
  if (body.technician !== undefined) next.technician = body.technician;
  if (body.customer) {
    const { snapshot, clientId } = await ensureStoreCustomerFromHaitechClient(body.customer);
    next.customerSnapshot = snapshot;
    next.clientId = clientId;
  }

  return saveServiceRequest(next, 'update');
}

export async function upsertServiceRequestFromInbound(payload) {
  const existing = payload.id
    ? (await readServiceRequests()).requests.find((r) => r.id === payload.id)
    : null;

  const customer = inboundPayloadToHaitechClient(
    payload.customerSnapshot ?? payload.customer_snapshot ?? payload.customer ?? {},
  );

  const record = {
    id: payload.id ?? randomUUID(),
    code: payload.code ?? existing?.code ?? generateCode(),
    clientId: payload.clientId ?? payload.client_id ?? existing?.clientId ?? null,
    haisupportRequestId: payload.haisupportRequestId ?? payload.haisupport_request_id ?? null,
    customerSnapshot: customer,
    categoryId: payload.categoryId ?? payload.category_id ?? existing?.categoryId ?? 'cat-correctivo',
    categoryLabel: payload.categoryLabel ?? payload.category_label ?? payload.categoryId ?? 'Servicio',
    description: String(payload.description ?? existing?.description ?? '').trim() || '—',
    status: VALID_STATUS.has(payload.status) ? payload.status : existing?.status ?? 'pending',
    scheduledAt: payload.scheduledAt ?? payload.scheduled_at ?? existing?.scheduledAt ?? new Date().toISOString(),
    technician: payload.technician ?? existing?.technician ?? null,
    address: payload.address ?? customer.direccion ?? null,
    city: payload.city ?? customer.ciudad ?? null,
    source: 'haisupport',
    createdAt: payload.createdAt ?? payload.created_at ?? existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('store_service_requests').upsert(recordToRow(record), { onConflict: 'id' });
    if (error) throw new Error('No se pudo sincronizar solicitud de servicio');
  }

  return rowToRecord(recordToRow(record));
}

export async function readServiceCategories() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('store_service_categories')
    .select('id, name, description, active, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    if (/relation|schema cache|Could not find/i.test(error.message)) return [];
    throw new Error('No se pudieron cargar categorías');
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    active: row.active === true,
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function patchServiceCategory(id, body) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const patch = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.description !== undefined) patch.description = String(body.description).trim();
  if (body.active !== undefined) patch.active = Boolean(body.active);

  const { data, error } = await supabase
    .from('store_service_categories')
    .update(patch)
    .eq('id', id)
    .select('id, name, description, active, sort_order')
    .maybeSingle();

  if (error || !data) throw new Error('No se pudo actualizar la categoría');

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? '',
    active: data.active === true,
    sortOrder: data.sort_order ?? 0,
  };
}
