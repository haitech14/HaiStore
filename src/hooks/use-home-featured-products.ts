import { useHomeCatalogBundleFeatured } from '@/hooks/use-home-catalog-bundle';

export const HOME_FEATURED_QUERY_KEY = 'home-catalog-bundle';

export function useHomeFeaturedProducts() {
  return useHomeCatalogBundleFeatured();
}
