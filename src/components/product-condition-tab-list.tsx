import {
  PRODUCT_CONDITION_LABELS,
  PRODUCT_CONDITIONS,
  type ProductCondition,
} from '@/lib/product-condition';
import { cn } from '@/lib/utils';

interface ProductConditionTabListProps {
  idPrefix: string;
  activeCondition: ProductCondition;
  onSelect: (condition: ProductCondition) => void;
  counts?: Partial<Record<ProductCondition, number>>;
  ariaLabel: string;
  className?: string;
}

export function ProductConditionTabList({
  idPrefix,
  activeCondition,
  onSelect,
  counts,
  ariaLabel,
  className,
}: ProductConditionTabListProps) {
  return (
    <div
      className={cn(
        'flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-lg bg-neutral-100 p-1',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {PRODUCT_CONDITIONS.map((condition) => {
        const count = counts?.[condition];
        const isActive = activeCondition === condition;
        return (
          <button
            key={condition}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${condition}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${condition}`}
            onClick={() => onSelect(condition)}
            className={cn(
              'min-h-11 shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              isActive
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            {PRODUCT_CONDITION_LABELS[condition]}
            {count != null ? (
              <span className="sr-only">
                {`, ${count} producto${count === 1 ? '' : 's'}`}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
