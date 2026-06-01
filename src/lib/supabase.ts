import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/lib/supabase-config';

let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!isSupabaseConfigured()) {
    console.warn(
      '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
        'Copia .env.example a .env y rellena tus credenciales.',
    );
    client = createClient('https://placeholder.local', 'placeholder-key', {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return client;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}

/** Cliente Supabase (solo operativo si `isSupabaseConfigured()` es true). */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = getSupabaseClient()[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value;
  },
});
