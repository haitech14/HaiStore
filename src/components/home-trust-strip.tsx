import { HOME_TRUST_BENEFITS } from '@/data/home-trust-benefits';
import { cn } from '@/lib/utils';

export function HomeTrustStrip() {
  return (
    <section
      aria-label="Beneficios y garantías HaiStore"
      className="border-y border-border/50 bg-muted/30"
    >
      <div className="container py-4 sm:py-5">
        <ul
          className={cn(
            'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]',
            'sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-6',
            '[&::-webkit-scrollbar]:hidden',
          )}
        >
          {HOME_TRUST_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li
                key={benefit.id}
                className={cn(
                  'group relative flex min-h-[7.75rem] min-w-[11.25rem] shrink-0 snap-start flex-col items-center justify-center gap-2.5',
                  'overflow-hidden rounded-xl border border-white/10 px-3.5 py-4 text-center',
                  'bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950',
                  'shadow-[0_8px_24px_-16px_rgba(0,0,0,0.65)] transition-[transform,box-shadow,border-color] duration-200',
                  'hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.75)]',
                  'sm:min-w-0',
                )}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-red-600/20 blur-2xl transition-opacity duration-200 group-hover:bg-red-600/30"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/80 to-transparent"
                />

                <span
                  className={cn(
                    'relative flex size-10 shrink-0 items-center justify-center rounded-lg',
                    'border border-red-500/35 bg-red-600/15 text-red-400',
                    'ring-1 ring-red-500/20 shadow-[0_0_18px_rgba(220,38,38,0.22)]',
                    'transition-transform duration-200 group-hover:scale-105',
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-[1.125rem]" strokeWidth={1.75} />
                </span>

                <div className="relative min-w-0 space-y-0.5">
                  <p className="text-pretty text-xs font-bold leading-snug text-white sm:text-[0.8125rem]">
                    {benefit.title}
                  </p>
                  <p className="text-pretty text-[0.6875rem] leading-snug text-white/65 sm:text-xs">
                    {benefit.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
