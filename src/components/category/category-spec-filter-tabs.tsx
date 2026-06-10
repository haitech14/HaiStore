import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CatalogSpecFilterTab {
  key: string;
  label: string;
  count: number;
}

type CatalogTabsAlign = 'start' | 'center' | 'end';

interface CategorySpecFilterTabsProps {
  tabs: CatalogSpecFilterTab[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  className?: string;
  ariaLabel?: string;
  groupLabel?: string;
  heading?: string;
  nested?: boolean;
  align?: CatalogTabsAlign;
}

const tabsRowAlignClass: Record<CatalogTabsAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

export function CategorySpecFilterTabs({
  tabs,
  selectedKeys,
  onToggle,
  className,
  ariaLabel = 'Filtros de formato y color',
  groupLabel = 'Formato y color',
  heading = 'Subcategorías',
  nested = false,
  align = 'start',
}: CategorySpecFilterTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className={className}>
      <div
        className={cn(
          '-mx-4 flex flex-wrap items-center gap-x-3 gap-y-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0',
          tabsRowAlignClass[align],
          nested && 'border-l-2 border-red-600/30 pl-3 sm:pl-4',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        <p className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
          {heading}
        </p>
        <div
          role="group"
          aria-label={groupLabel}
          className={cn('flex flex-wrap items-center gap-1.5', tabsRowAlignClass[align])}
        >
        {tabs.map((tab) => {
          const isActive = selectedKeys.includes(tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              disabled={tab.count === 0}
              onClick={() => onToggle(tab.key)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md border font-semibold shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-45',
                nested
                  ? 'min-h-9 px-3 py-1.5 text-xs'
                  : 'min-h-11 gap-2 rounded-lg px-3.5 py-2 text-sm',
                isActive
                  ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                  : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
              )}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count > 0 ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5 min-w-5 shrink-0 px-1.5 text-[0.65rem] leading-none',
                    isActive && 'border-white/25 bg-white/20 text-white',
                  )}
                >
                  {tab.count}
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
