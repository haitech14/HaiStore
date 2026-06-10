import { Badge } from '@/components/ui/badge';
import { formatSubcategoryTabLabel } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

type CatalogTabsAlign = 'start' | 'center' | 'end';

interface SubcategoryTabsProps {
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  onSelect: (subSlug: string | null) => void;
  className?: string;
  heading?: string;
  parentName?: string | null;
  align?: CatalogTabsAlign;
}

const tabsRowAlignClass: Record<CatalogTabsAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

function CatalogTabsHeading({ children }: { children: string }) {
  return (
    <p className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
      {children}
    </p>
  );
}

export function SubcategoryTabs({
  subcategories,
  activeSubSlug,
  onSelect,
  className,
  heading = 'Categorías',
  parentName = null,
  align = 'start',
}: SubcategoryTabsProps) {
  if (subcategories.length === 0) return null;

  return (
    <section aria-label={heading} className={className}>
      <div
        className={cn(
          '-mx-4 flex flex-wrap items-center gap-x-3 gap-y-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0',
          tabsRowAlignClass[align],
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        <CatalogTabsHeading>{heading}</CatalogTabsHeading>
        <div
          role="tablist"
          aria-label={heading}
          className={cn('flex flex-wrap items-center gap-2', tabsRowAlignClass[align])}
        >
        {subcategories.map((sub) => {
          const isActive = activeSubSlug === sub.slug;
          const count = sub.productCount ?? 0;
          const label = formatSubcategoryTabLabel(sub.name, parentName);

          return (
            <button
              key={sub.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(sub.slug)}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                isActive
                  ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                  : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
              )}
            >
              <span className="whitespace-nowrap">{label}</span>
              {count > 0 ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5 min-w-5 shrink-0 px-1.5 text-[0.65rem] leading-none',
                    isActive && 'border-white/25 bg-white/20 text-white',
                  )}
                >
                  {count}
                </Badge>
              ) : null}
            </button>
          );
        })}
        </div>
      </div>
    </section>
  );
}
