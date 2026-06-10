import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CategoryCatalogFiltersRowProps {
  subcategories: ReactNode;
  filters: ReactNode;
  className?: string;
}

export function CategoryCatalogFiltersRow({
  subcategories,
  filters,
  className,
}: CategoryCatalogFiltersRowProps) {
  const hasSubcategories = subcategories != null;
  const hasFilters = filters != null;

  if (!hasSubcategories && !hasFilters) return null;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-border/60 pt-6 sm:gap-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      {hasSubcategories ? <div className="min-w-0 flex-1">{subcategories}</div> : null}
      {hasFilters ? (
        <div className="min-w-0 lg:flex lg:flex-1 lg:justify-end">{filters}</div>
      ) : null}
    </div>
  );
}
