import { ArrowRight } from 'lucide-react';

import type { ServiceLandingSlug } from '@/data/service-landings';
import {
  getServiceHubHeroBanners,
  type ServiceHubHeroVariant,
} from '@/lib/service-hub-heroes';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<
  ServiceHubHeroVariant,
  { header: string; footer: string; accent: string }
> = {
  rental: {
    header: 'bg-gradient-to-br from-neutral-950 via-[#1a1208] to-neutral-900',
    footer: 'bg-neutral-950',
    accent: 'bg-amber-500/15',
  },
  support: {
    header: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800',
    footer: 'bg-neutral-950',
    accent: 'bg-red-600/15',
  },
  outsourcing: {
    header: 'bg-gradient-to-br from-[#0a1628] via-[#0f2038] to-[#152238]',
    footer: 'bg-[#0a1628]',
    accent: 'bg-blue-500/15',
  },
  corporate: {
    header: 'bg-gradient-to-br from-[#0c1424] via-[#101c32] to-[#162544]',
    footer: 'bg-[#0c1424]',
    accent: 'bg-sky-500/15',
  },
};

interface ServiceHubHeroBannersProps {
  activeSection: ServiceLandingSlug;
  onSelect: (section: ServiceLandingSlug) => void;
  idPrefix?: string;
}

export function ServiceHubHeroBanners({
  activeSection,
  onSelect,
  idPrefix = 'servicios-hub',
}: ServiceHubHeroBannersProps) {
  const banners = getServiceHubHeroBanners();

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      role="tablist"
      aria-label="Categorías de servicios"
    >
      {banners.map((banner) => {
        const isActive = activeSection === banner.slug;
        const styles = VARIANT_STYLES[banner.variant];

        return (
          <article key={banner.slug} className="min-w-0">
            <button
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${banner.slug}`}
              aria-selected={isActive}
              aria-controls={`${idPrefix}-panel-${banner.slug}`}
              onClick={() => onSelect(banner.slug)}
              className={cn(
                'group flex min-h-[20rem] w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-[0_12px_32px_-18px_hsl(var(--foreground)/0.55)] transition-all sm:min-h-[22rem] lg:min-h-[26rem] lg:aspect-[3/4] lg:max-h-[28rem]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                isActive
                  ? 'border-red-600 ring-2 ring-red-600/40'
                  : 'border-border/70 hover:-translate-y-0.5 hover:border-red-600/35',
              )}
            >
              <div className={cn('relative px-4 pb-4 pt-4 sm:px-5 sm:pt-5', styles.header)}>
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute -right-6 top-0 size-24 rounded-full blur-3xl',
                    styles.accent,
                  )}
                />
                <div className="relative flex flex-col gap-2">
                  <p className="text-balance text-lg font-bold tracking-tight text-white sm:text-xl">
                    {banner.title}
                  </p>
                  <p className="text-pretty text-sm leading-snug text-white/85">
                    {banner.description}
                  </p>
                  <span className="sr-only">{banner.imageAlt}</span>
                </div>
              </div>

              <div className="relative flex min-h-[9.5rem] flex-1 items-end justify-center bg-gradient-to-b from-white to-neutral-100 px-3 pb-2 pt-3 sm:min-h-[10.5rem] sm:px-4">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-950/20 to-transparent"
                />
                <img
                  src={banner.image}
                  alt=""
                  className="relative z-10 max-h-full w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

              <div
                className={cn(
                  'flex items-center px-4 py-3 sm:px-5',
                  styles.footer,
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
                    isActive ? 'text-red-300' : 'text-red-400 group-hover:text-red-300',
                  )}
                >
                  {isActive ? 'Seleccionado' : 'Ver servicios'}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
