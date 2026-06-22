import type { QueryClient } from '@tanstack/react-query';

import {
  fetchHomeCatalogBundle,
  fetchHomeCatalogBundleInitial,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
} from '@/lib/home-catalog-bundle';

/** Precarga snapshot estático y luego revalida contra la API en segundo plano. */
export async function prefetchHomeCatalog(queryClient: QueryClient) {
  const initial = await fetchHomeCatalogBundleInitial();
  if (initial) {
    queryClient.setQueryData([HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', null], initial);
  }

  return queryClient.prefetchQuery({
    queryKey: [HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', null],
    queryFn: fetchHomeCatalogBundle,
    staleTime: 1000 * 60 * 5,
  });
}
