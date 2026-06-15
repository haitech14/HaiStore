import type { ReactNode } from 'react';

import { catalogGridClassName, type CatalogGridColumns } from '@/lib/category-grid-layout';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

export interface CatalogFormatSection {
  id: 'bn' | 'color';
  title: string;
  products: Product[];
}

interface CategoryCatalogFormatSectionsProps {
  sections: CatalogFormatSection[];
  gridColumns: CatalogGridColumns;
  renderProduct: (product: Product) => ReactNode;
  className?: string;
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-2 sm:mb-4">
      <h3 className="text-balance text-base font-bold tracking-tight text-[#0f1f3d] sm:text-lg">
        {title}
      </h3>
      <span className="pb-0.5 text-xs text-muted-foreground sm:text-sm">
        ({count} {count === 1 ? 'producto' : 'productos'})
      </span>
      <span className="mb-1 hidden h-px min-w-[2rem] flex-1 bg-red-600/70 sm:block" aria-hidden="true" />
    </div>
  );
}

export function CategoryCatalogFormatSections({
  sections,
  gridColumns,
  renderProduct,
  className,
}: CategoryCatalogFormatSectionsProps) {
  const visibleSections = sections.filter((section) => section.products.length > 0);
  if (visibleSections.length === 0) return null;

  return (
    <div className={cn('space-y-8 sm:space-y-10', className)}>
      {visibleSections.map((section) => (
        <section key={section.id} aria-labelledby={`catalog-format-${section.id}`}>
          <SectionHeading
            title={section.title}
            count={section.products.length}
          />
          <span id={`catalog-format-${section.id}`} className="sr-only">
            {section.title}
          </span>
          <div className={catalogGridClassName(gridColumns)}>
            {section.products.map((product) => (
              <div key={product.id} className="min-w-0">
                {renderProduct(product)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
