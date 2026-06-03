import { getSupabaseAdmin } from './supabase-auth.js';

function rowToProforma(row) {
  const record = row.record && typeof row.record === 'object' ? row.record : {};
  return {
    ...record,
    id: row.id,
    documentNumber: row.document_number ?? record.documentNumber,
    followUpStatus: row.follow_up_status ?? record.followUpStatus ?? 'pending',
    createdAt: row.created_at ?? record.createdAt,
    updatedAt: row.updated_at ?? record.updatedAt,
  };
}

function proformaToRow(proforma) {
  return {
    id: proforma.id,
    document_number: proforma.documentNumber,
    follow_up_status: proforma.followUpStatus,
    record: proforma,
    created_at: proforma.createdAt,
    updated_at: proforma.updatedAt,
  };
}

export async function readProformasFromSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('store_proformas')
    .select('id, document_number, follow_up_status, record, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[proformas] supabase read:', error.message);
    throw new Error('No se pudo cargar proformas desde Supabase');
  }

  const proformas = (data ?? []).map(rowToProforma);
  return { proformas };
}

export async function writeProformasToSupabase(proformas) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const rows = proformas.map(proformaToRow);
  const { error } = await supabase.from('store_proformas').upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[proformas] supabase write:', error.message);
    throw new Error('No se pudo guardar proformas en Supabase');
  }

  return proformas;
}

export async function upsertProformaInSupabase(proforma) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { error } = await supabase.from('store_proformas').upsert(proformaToRow(proforma), {
    onConflict: 'id',
  });

  if (error) {
    console.error('[proformas] supabase upsert:', error.message);
    throw new Error('No se pudo guardar la proforma en Supabase');
  }

  return proforma;
}

export async function deleteProformaFromSupabase(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { error } = await supabase.from('store_proformas').delete().eq('id', id);
  if (error) {
    console.error('[proformas] supabase delete:', error.message);
    throw new Error('No se pudo eliminar la proforma en Supabase');
  }

  return true;
}
