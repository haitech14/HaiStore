import { Link, useSearchParams } from 'react-router-dom';

import { categoryPathAll, categoryPathWithCondition } from '@/lib/category-path';
import {
  PRODUCT_CONDITION_LABELS,
  PRODUCT_CONDITIONS,
  parseProductCondition,
  type ProductCondition,
} from '@/lib/product-condition';
import { cn } from '@/lib/utils';

interface ProductConditionTabsProps {
  categorySlug: string;
  activeCondition: ProductCondition | null;
  counts?: Partial<Record<ProductCondition, number>>;
  className?: string;
}

export function ProductConditionTabs({
  categorySlug,
  activeCondition,
  counts,
  className,
}: ProductConditionTabsProps) {
  const [searchParams] = useSearchParams();
  const subSlug = searchParams.get('sub');

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label="Filtrar por condición del producto"
    >
      <Link
        to={categoryPathAll(categorySlug, subSlug)}
        role="tab"
        aria-selected={activeCondition === null}
        className={cn(
          'min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          activeCondition === null
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300',
        )}
      >
        Todos
      </Link>
      {PRODUCT_CONDITIONS.map((condition) => {
        const count = counts?.[condition];
        const disabled = count === 0;
        return (
          <Link
            key={condition}
            to={categoryPathWithCondition(categorySlug, condition, subSlug)}
            role="tab"
            aria-selected={activeCondition === condition}
            aria-disabled={disabled}
            className={cn(
              'min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              activeCondition === condition
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300',
              disabled && 'pointer-events-none opacity-45',
            )}
            onClick={(event) => {
              if (disabled) event.preventDefault();
            }}
          >
            {PRODUCT_CONDITION_LABELS[condition]}
          </Link>
        );
      })}
    </div>
  );
}

export function useCategoryConditionFilter(): ProductCondition | null {
  const [searchParams] = useSearchParams();
  return parseProductCondition(searchParams.get('estado'));
}
