import { createClient } from '@supabase/supabase-js';

let haisalesAdminClient = null;

/** URL del proyecto Supabase de HaiSales (sin /rest/v1). Por defecto = SUPABASE_URL. */
export function getHaiSalesSupabaseUrl() {
  const dedicated = process.env.HAISALES_API_URL?.trim();
  if (dedicated) {
    return dedicated.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  }
  const store = process.env.SUPABASE_URL?.trim();
  return store ? store.replace(/\/+$/, '') : null;
}

export function getHaiSalesSupabaseKey() {
  return (
    process.env.HAISALES_API_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    null
  );
}

export function getHaiSalesSupabaseAdmin() {
  if (haisalesAdminClient) return haisalesAdminClient;

  const url = getHaiSalesSupabaseUrl();
  const serviceKey = getHaiSalesSupabaseKey();
  if (!url?.includes('supabase.co') || !serviceKey) return null;

  haisalesAdminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  return haisalesAdminClient;
}

export function isHaiSalesSupabaseConfigured() {
  return Boolean(getHaiSalesSupabaseAdmin());
}

export function isHaiSalesRemoteDatabase() {
  const dedicated = process.env.HAISALES_API_URL?.trim();
  const store = process.env.SUPABASE_URL?.trim();
  if (!dedicated || !store) return false;
  return dedicated.replace(/\/+$/, '') !== store.replace(/\/+$/, '');
}

export const HAISALES_TABLE_PERSONA =
  process.env.HAISALES_TABLE_PERSONA?.trim() || 'haisales_persona';

export const HAISALES_TABLE_VENTAS =
  process.env.HAISALES_TABLE_VENTAS?.trim() || 'haisales_ventas';
