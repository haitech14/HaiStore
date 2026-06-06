import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_ECOSYSTEM_BANNERS,
  type HaitechEcosystemBanner,
} from '@/data/haitech-ecosystem';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<
  HaitechEcosystemBanner['variant'],
  { shell: string; overlay: string; glow: string }
> = {
  support: {
    shell: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800',
    overlay: 'bg-gradient-to-r from-neutral-950 via-neutral-950/95 to-neutral-900/20',
    glow: 'bg-red-600/20',
  },
  sales: {
    shell: 'bg-gradient-to-br from-[#0a1628] via-[#0f2038] to-[#152238]',
    overlay: 'bg-gradient-to-r from-[#0a1628] via-[#0a1628]/95 to-[#0f2038]/15',
    glow: 'bg-blue-500/15',
  },
  rent: {
    shell: 'bg-gradient-to-br from-neutral-950 via-[#1a1208] to-neutral-900',
    overlay: 'bg-gradient-to-r from-neutral-950 via-neutral-950/95 to-amber-950/20',
    glow: 'bg-amber-500/15',
  },
  protect: {
    shell: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    overlay: 'bg-gradient-to-r from-[#0f172a] via-[#0f172a]/95 to-emerald-950/20',
    glow: 'bg-emerald-500/15',
  },
};

function BannerCard({ banner }: { banner: HaitechEcosystemBanner }) {
  const styles = VARIANT_STYLES[banner.variant];
  const className = cn(
    'group relative flex min-h-[11.5rem] overflow-hidden rounded-xl border border-border/70 shadow-[0_8px_24px_-16px_hsl(var(--foreground)/0.45)] transition-all',
    'hover:-translate-y-0.5 hover:border-red-600/30 hover:shadow-[0_14px_28px_-16px_hsl(var(--foreground)/0.5)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
    styles.shell,
  );

  const content = (
    <>
      <img
        src={banner.image}
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[52%] object-contain object-right opacity-35 transition-opacity duration-300 group-hover:opacity-45 sm:w-[48%] sm:opacity-40"
        loading="lazy"
      />
      <div
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-0', styles.overlay)}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-8 top-0 size-40 rounded-full blur-3xl',
          styles.glow,
        )}
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-2 lg:max-w-[16rem] xl:max-w-[18rem]">
          <div className="flex items-center gap-2">
            {banner.logoUrl ? (
              <img
                src={banner.logoUrl}
                alt={banner.logoAlt ?? `${banner.brandPrefix}${banner.brandSuffix}`}
                className="h-10 w-auto max-w-[13rem] object-contain object-left sm:h-11 sm:max-w-[14rem]"
                loading="lazy"
              />
            ) : (
              <>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-500"
                  aria-hidden="true"
                >
                  {banner.icon ? <banner.icon className="size-4" /> : null}
                </span>
                <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  <span className="text-red-500">{banner.brandPrefix}</span>
                  {banner.brandSuffix}
                </p>
              </>
            )}
          </div>
          <p className="text-pretty text-sm leading-snug text-white/85 sm:text-[0.9375rem]">
            {banner.description}
          </p>
          <span className="sr-only">{banner.imageAlt}</span>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-red-400 transition-colors group-hover:text-red-300">
          {banner.ctaLabel}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </>
  );

  if (banner.external !== false) {
    return (
      <a
        href={banner.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={banner.href} className={className}>
      {content}
    </Link>
  );
}

export function HaitechEcosystemBanners() {
  return (
    <div
      className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="list"
      aria-label="Plataformas y servicios Haitech"
    >
      {HAITECH_ECOSYSTEM_BANNERS.map((banner) => (
        <article key={banner.id} role="listitem" className="min-w-0">
          <BannerCard banner={banner} />
        </article>
      ))}
    </div>
  );
}
