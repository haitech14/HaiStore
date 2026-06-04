import { BadgePercent, Headphones, Printer, Sparkles } from 'lucide-react';

import type { CategoryHeroFeatureIcon, ResolvedCategoryHero } from '@/data/category-hero';
import { cn } from '@/lib/utils';

const FEATURE_ICONS: Record<CategoryHeroFeatureIcon, typeof BadgePercent> = {
  'badge-percent': BadgePercent,
  printer: Printer,
  headset: Headphones,
};

interface CategoryHeroBannerProps {
  content: ResolvedCategoryHero;
}

export function CategoryHeroBanner({ content }: CategoryHeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border shadow-md"
      role="region"
      aria-label={content.title}
    >
      <div className="relative flex min-h-[200px] flex-col justify-end sm:min-h-[240px] lg:min-h-[280px]">
        <img
          src={content.image}
          alt=""
          className="absolute inset-0 size-full object-cover object-right-center lg:object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-900/80 to-neutral-900/20 lg:via-neutral-900/55 lg:to-transparent"
          aria-hidden="true"
        />
        <div className="relative z-10 grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-6 lg:p-8">
          <div className="flex max-w-2xl flex-col gap-2.5 sm:gap-3">
            {content.badge ? (
              <span className="inline-flex w-fit rounded-md bg-red-600 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:text-xs">
                {content.badge}
              </span>
            ) : null}
            <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {content.title}
            </h1>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
              {content.subtitle}
            </p>

            {content.features.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
                {content.features.map((feature) => {
                  const Icon = FEATURE_ICONS[feature.icon];
                  return (
                    <li
                      key={feature.label}
                      className="flex items-center gap-2 text-xs font-medium text-white/95 sm:text-sm"
                    >
                      <Icon className="size-4 shrink-0 text-red-400" aria-hidden="true" />
                      {feature.label}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <span className="sr-only">{content.imageAlt}</span>
          </div>

          {content.promoCard ? (
            <aside
              className={cn(
                'hidden max-w-[220px] rounded-xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur-sm',
                'lg:block',
              )}
              aria-label={content.promoCard.title}
            >
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-foreground">{content.promoCard.title}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {content.promoCard.subtitle}
              </p>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
