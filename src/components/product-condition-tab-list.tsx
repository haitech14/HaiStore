import { BadgeCheck, Cog, Package, Recycle, type LucideIcon } from 'lucide-react';

import {
  getProductConditionLabel,
  PRODUCT_CONDITIONS,
  type CatalogFamilySlug,
  type ProductCondition,
} from '@/lib/product-condition';
import { cn } from '@/lib/utils';

const CONDITION_ICONS: Record<ProductCondition, LucideIcon> = {
  originales: BadgeCheck,
  compatibles: Package,
  remanufacturados: Recycle,
  partes: Cog,
};

interface ProductConditionTabListProps {
  idPrefix: string;
  activeCondition: ProductCondition;
  onSelect: (condition: ProductCondition) => void;
  counts?: Partial<Record<ProductCondition, number>>;
  ariaLabel: string;
  className?: string;
  /** Si se indica multifuncionales/impresoras: Nuevos, Seminuevos, Remanufacturados (3 tabs). */
  catalogFamily?: CatalogFamilySlug | null;
  conditions?: readonly ProductCondition[];
}

export function ProductConditionTabList({
  idPrefix,
  activeCondition,
  onSelect,
  counts,
  ariaLabel,
  className,
  catalogFamily = null,
  conditions = PRODUCT_CONDITIONS,
}: ProductConditionTabListProps) {
  return (
    <div
      className={cn(
        'flex max-w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {conditions.map((condition) => {
        const count = counts?.[condition];
        const isActive = activeCondition === condition;
        const Icon = CONDITION_ICONS[condition];
        const label = getProductConditionLabel(condition, catalogFamily);

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
              'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              isActive
                ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                : 'border-neutral-200/90 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" strokeWidth={2} />
            {label}
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
