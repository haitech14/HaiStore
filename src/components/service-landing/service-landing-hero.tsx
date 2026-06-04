import type { ServiceLandingConfig } from '@/types/service-landing';
import { cn } from '@/lib/utils';

interface ServiceLandingHeroProps {
  config: Pick<
    ServiceLandingConfig,
    'badge' | 'badgeIcon' | 'title' | 'titleHighlight' | 'subtitle' | 'bullets' | 'highlightBulletIndex'
  >;
}

export function ServiceLandingHero({ config }: ServiceLandingHeroProps) {
  const BadgeIcon = config.badgeIcon;

  return (
    <header className="mx-auto max-w-4xl text-center">
      <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sky-700 sm:text-xs">
        <BadgeIcon className="size-4 shrink-0" aria-hidden="true" strokeWidth={2} />
        {config.badge}
      </p>

      <h1 className="mt-5 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {config.title}{' '}
        <span className="text-sky-600">{config.titleHighlight}</span>
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
        {config.subtitle}
      </p>

      <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
        {config.bullets.map((bullet, index) => (
          <li key={bullet} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span className="text-sky-500" aria-hidden="true">
                •
              </span>
            ) : null}
            <span
              className={cn(
                index === config.highlightBulletIndex && 'text-orange-600',
              )}
            >
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    </header>
  );
}
