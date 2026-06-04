/**
 * Comprueba que HaiStore, HaiSupport y HaiSales apunten al mismo Supabase (auth unificado).
 */

function normalizeSupabaseOrigin(url) {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, ''));
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getUnifiedAuthEnvStatus() {
  const store = normalizeSupabaseOrigin(process.env.SUPABASE_URL);
  const support = normalizeSupabaseOrigin(process.env.HAISUPPORT_API_URL);
  const sales = normalizeSupabaseOrigin(process.env.HAISALES_API_URL);
  const vite = normalizeSupabaseOrigin(process.env.VITE_SUPABASE_URL);

  const origins = [store, support, sales, vite].filter(Boolean);
  const unique = [...new Set(origins)];

  return {
    storeOrigin: store,
    supportOrigin: support,
    salesOrigin: sales ?? store,
    viteOrigin: vite,
    unified: unique.length <= 1 && Boolean(store),
    warnings: [
      ...(support && store && support !== store
        ? ['HAISUPPORT_API_URL apunta a otro proyecto que SUPABASE_URL']
        : []),
      ...(sales && store && sales !== store
        ? ['HAISALES_API_URL apunta a otro proyecto que SUPABASE_URL']
        : []),
      ...(vite && store && vite !== store
        ? ['VITE_SUPABASE_URL difiere de SUPABASE_URL']
        : []),
      ...(!store ? ['Falta SUPABASE_URL'] : []),
    ],
  };
}
