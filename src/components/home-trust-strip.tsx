import { HOME_TRUST_BENEFITS } from '@/data/home-trust-benefits';
import { cn } from '@/lib/utils';

export function HomeTrustStrip() {
  return (
    <section
      aria-label="Beneficios y garantías HaiStore"
      className="border-y border-border/60 bg-card"
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
                className="group relative flex min-w-[15.5rem] shrink-0 snap-start items-start gap-3 px-3 py-3.5 sm:min-w-0"
              >
                <span
                  className={cn(
                    'relative flex size-10 shrink-0 items-center justify-center rounded-full',
                    'bg-red-600 text-white shadow-[0_4px_14px_-4px_hsl(var(--destructive)/0.55)]',
                    'transition-transform duration-200 group-hover:scale-105',
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-[1.125rem]" strokeWidth={2} />
                </span>

                <div className="relative min-w-0 flex-1 pt-0.5">
                  <p className="text-pretty text-sm font-bold leading-snug text-foreground">
                    {benefit.title}
                  </p>
                  <p className="mt-0.5 text-pretty text-xs leading-snug text-muted-foreground">
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
