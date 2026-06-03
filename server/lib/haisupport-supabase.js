import { createClient } from '@supabase/supabase-js';

let haisupportAdminClient = null;

/** URL base del proyecto Supabase de HaiSupport (sin /rest/v1). */
export function getHaiSupportSupabaseUrl() {
  const raw = process.env.HAISUPPORT_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

export function getHaiSupportSupabaseAdmin() {
  if (haisupportAdminClient) return haisupportAdminClient;

  const url = getHaiSupportSupabaseUrl();
  const serviceKey = process.env.HAISUPPORT_API_KEY?.trim();
  if (!url?.includes('supabase.co') || !serviceKey) return null;

  haisupportAdminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  return haisupportAdminClient;
}

export function isHaiSupportSupabaseConfigured() {
  return Boolean(getHaiSupportSupabaseAdmin());
}
