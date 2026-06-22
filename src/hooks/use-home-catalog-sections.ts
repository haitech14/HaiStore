import { useHomeCatalogBundleSections } from '@/hooks/use-home-catalog-bundle';



export { HOME_CATALOG_BUNDLE_QUERY_KEY as HOME_CATALOG_SECTIONS_QUERY_KEY } from '@/lib/home-catalog-bundle';

export type { HomeCatalogSectionPayload } from '@/lib/home-catalog-bundle';



export function useHomeCatalogSections(sectionIds: string[], _limit = 10) {

  return useHomeCatalogBundleSections(sectionIds);

}

