import { isSupabaseAuthEnabled } from './supabase-auth.js';

/** Supabase como fuente compartida HaiStore ↔ HaiSupport (salvo override file). */
export function shouldUseSharedSupabaseData() {
  if (!isSupabaseAuthEnabled()) return false;
  if (process.env.HAISTORE_DATA_SOURCE === 'file') return false;
  return true;
}
