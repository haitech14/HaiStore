import { useEffect } from 'react';

import { applyPageSeo, resetPageSeo, type PageSeoConfig } from '@/lib/seo';

export function useSeo(config: PageSeoConfig | null | undefined) {
  const jsonLdKey = config?.jsonLd ? JSON.stringify(config.jsonLd) : '';

  useEffect(() => {
    if (!config) return undefined;
    applyPageSeo(config);
    return () => {
      resetPageSeo();
    };
  }, [
    config?.title,
    config?.description,
    config?.canonical,
    config?.image,
    config?.imageAlt,
    config?.ogType,
    config?.robots,
    jsonLdKey,
  ]);
}
