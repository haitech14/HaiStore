import type { ServiceLandingSlug } from '@/data/service-landings';
import { SERVICE_HUB_TABS } from '@/lib/service-hub';
import { cn } from '@/lib/utils';

interface ServiceHubTabListProps {
  activeSection: ServiceLandingSlug;
  onSelect: (section: ServiceLandingSlug) => void;
  idPrefix?: string;
  className?: string;
}

export function ServiceHubTabList({
  activeSection,
  onSelect,
  idPrefix = 'servicios-hub',
  className,
}: ServiceHubTabListProps) {
  return (
    <div
      role="tablist"
      aria-label="Categorías de servicios"
      className={cn(
        'flex max-w-full flex-wrap items-center justify-center gap-2',
        className,
      )}
    >
      {SERVICE_HUB_TABS.map((tab) => {
        const isActive = activeSection === tab.slug;

        return (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.slug}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${tab.slug}`}
            onClick={() => onSelect(tab.slug)}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              isActive
                ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
