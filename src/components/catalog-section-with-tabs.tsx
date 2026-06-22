import { useMemo, useState } from 'react';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import { ProductConditionTabList } from '@/components/product-condition-tab-list';
import type { FeaturedProduct } from '@/data/featured-products';
import type { HomeCatalogSectionConfig } from '@/lib/home-catalog-sections';
import {
  getConditionsForCatalogFamily,
  type ProductCondition,
} from '@/lib/product-condition';

interface CatalogSectionWithTabsProps {
  section: HomeCatalogSectionConfig;
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>;
  /** Opcional: limitar las condiciones visibles (p. ej. sin «Partes»). */
  conditionsOverride?: readonly ProductCondition[];
}

function productsForCondition(
  map: Record<ProductCondition, FeaturedProduct[]>,
  condition: ProductCondition,
): FeaturedProduct[] {
  return map[condition] ?? [];
}

function firstTabWithProducts(
  map: Record<ProductCondition, FeaturedProduct[]>,
  conditions: readonly ProductCondition[],
): ProductCondition {
  return (
    conditions.find((key) => productsForCondition(map, key).length > 0) ??
    conditions[0] ??
    'originales'
  );
}

const EMPTY_TAB_MESSAGES_BY_SECTION: Partial<
  Record<HomeCatalogSectionConfig['id'], Record<ProductCondition, string>>
> = {
  multifuncionales: {
    originales: 'Aún no hay multifuncionales nuevos en esta categoría.',
    compatibles: 'Aún no hay multifuncionales seminuevos en esta categoría.',
    remanufacturados: 'Aún no hay multifuncionales remanufacturados en esta categoría.',
    partes: 'Próximamente: partes para multifuncionales aquí.',
  },
  impresoras: {
    originales: 'Aún no hay impresoras nuevas en esta categoría.',
    compatibles: 'Aún no hay impresoras seminuevas en esta categoría.',
    remanufacturados: 'Aún no hay impresoras remanufacturadas en esta categoría.',
    partes: 'Próximamente: partes para impresoras aquí.',
  },
  'toner-suministros': {
    originales: 'Aún no hay tóner ni consumibles originales en esta categoría.',
    compatibles: 'Aún no hay tóner ni cartuchos compatibles en esta categoría.',
    remanufacturados: 'Aún no hay tóner remanufacturado o recargas en esta categoría.',
    partes: 'Aún no hay partes de consumibles en esta categoría.',
  },
  repuestos: {
    originales: 'Aún no hay repuestos originales en esta categoría.',
    compatibles: 'Aún no hay repuestos compatibles en esta categoría.',
    remanufacturados: 'Aún no hay repuestos remanufacturados en esta categoría.',
    partes: 'Aún no hay partes y componentes en esta categoría.',
  },
};

export function CatalogSectionWithTabs({
  section,
  productsByCondition,
  conditionsOverride,
}: CatalogSectionWithTabsProps) {
  const sectionConditions = useMemo(
    () => conditionsOverride ?? getConditionsForCatalogFamily(section.id),
    [conditionsOverride, section.id],
  );

  const [activeCondition, setActiveCondition] = useState<ProductCondition>(() =>
    firstTabWithProducts(productsByCondition, sectionConditions),
  );

  const activeProducts = productsForCondition(productsByCondition, activeCondition);
  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        sectionConditions.map((key) => [key, productsForCondition(productsByCondition, key).length]),
      ) as Record<ProductCondition, number>,
    [productsByCondition, sectionConditions],
  );

  const titleId = `${section.id}-titulo`;
  const emptyMessage =
    EMPTY_TAB_MESSAGES_BY_SECTION[section.id]?.[activeCondition] ??
    `No hay productos en esta categoría por ahora.`;

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl"
          >
            {section.title}
          </h2>
          {section.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground sm:text-[0.9375rem]">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        <ProductConditionTabList
          idPrefix={section.id}
          activeCondition={activeCondition}
          onSelect={setActiveCondition}
          counts={tabCounts}
          catalogFamily={section.id}
          conditions={sectionConditions}
          ariaLabel={`Filtrar ${section.title} por condición`}
          className="w-full lg:w-auto lg:max-w-[58%] xl:max-w-none"
        />
      </div>

      <div
        role="tabpanel"
        id={`${section.id}-panel-${activeCondition}`}
        aria-labelledby={`${section.id}-tab-${activeCondition}`}
      >
        {activeProducts.length > 0 ? (
          <ProductCarouselSection
            sectionId={`${section.id}-${activeCondition}`}
            title=""
            products={activeProducts}
            hideHeader
            showNavArrows
          />
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground" role="status">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}
