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
  interactive?: boolean;
  selected?: boolean;
  onActivate?: () => void;
  headingLevel?: 'h1' | 'h2';
  compact?: boolean;
  /** Tarjeta estrecha para filas de subcategorías. */
  inline?: boolean;
}

function HeroBody({
  content,
  headingLevel = 'h1',
  compact = false,
  inline = false,
}: Pick<CategoryHeroBannerProps, 'content' | 'headingLevel' | 'compact' | 'inline'>) {
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        'relative flex flex-col justify-end',
        inline
          ? 'min-h-[11.5rem] sm:min-h-[12.5rem]'
          : compact
            ? 'min-h-[168px] sm:min-h-[192px] lg:min-h-[212px]'
            : 'min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]',
      )}
    >
      <img
        src={content.image}
        alt=""
        className="absolute inset-0 size-full object-cover object-right-center lg:object-center"
        loading="lazy"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-900/80 to-neutral-900/20 lg:via-neutral-900/55 lg:to-transparent"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[36%] hidden w-px bg-red-600/70 sm:block"
        style={{ transform: 'skewX(-12deg)' }}
      />
      <div
        className={cn(
          'relative z-10 grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-6 lg:p-8',
          inline && 'gap-2 p-3 sm:p-4 lg:grid-cols-1 lg:p-4',
        )}
      >
        <div className={cn('flex max-w-2xl flex-col gap-2.5 sm:gap-3', inline && 'max-w-none gap-1.5')}>
          {content.badge ? (
            <span
              className={cn(
                'inline-flex w-fit rounded-md bg-red-600 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:text-xs',
                inline && 'px-2 py-0.5 text-[0.6rem]',
              )}
            >
              {content.badge}
            </span>
          ) : null}
          <Heading
            className={cn(
              'text-balance font-bold tracking-tight text-white',
              inline
                ? 'line-clamp-2 text-base sm:text-lg'
                : 'text-2xl sm:text-3xl lg:text-4xl',
            )}
          >
            {content.title}
          </Heading>
          <p
            className={cn(
              'max-w-xl text-pretty leading-relaxed text-white/90',
              inline
                ? 'line-clamp-2 text-xs sm:text-sm'
                : 'text-sm sm:text-base',
            )}
          >
            {content.subtitle}
          </p>

          {!inline && content.features.length > 0 ? (
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

        {content.promoCard && !inline ? (
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
  );
}

export function CategoryHeroBanner({
  content,
  interactive = false,
  selected = false,
  onActivate,
  headingLevel = 'h1',
  compact = false,
  inline = false,
}: CategoryHeroBannerProps) {
  const shellClass = cn(
    'relative h-full overflow-hidden rounded-2xl border shadow-md transition-all',
    interactive
      ? 'text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2'
      : 'border-border',
    interactive && selected
      ? 'border-red-600 ring-2 ring-red-600/35'
      : interactive
        ? 'border-border hover:border-red-600/40 hover:shadow-lg'
        : 'border-border',
  );

  if (interactive) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${content.title}. ${content.subtitle}`}
        onClick={onActivate}
        className={shellClass}
      >
        <HeroBody
          content={content}
          headingLevel={headingLevel}
          compact={compact}
          inline={inline}
        />
      </button>
    );
  }

  return (
    <div className={shellClass} role="region" aria-label={content.title}>
      <HeroBody
        content={content}
        headingLevel={headingLevel}
        compact={compact}
        inline={inline}
      />
    </div>
  );
}
