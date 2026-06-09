import { HOME_TRUST_BENEFITS } from '@/data/home-trust-benefits';
import { cn } from '@/lib/utils';

export function HomeTrustStrip() {
  return (
    <section
      aria-label="Beneficios y garantías HaiStore"
      className="border-y border-border/50 bg-background"
    >
      <div className="container py-4 sm:py-5">
        <ul
          className={cn(
            'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden',
          )}
        >
          {HOME_TRUST_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li
                key={benefit.id}
                className="flex min-w-[7.75rem] shrink-0 flex-col items-center gap-2 rounded-lg bg-black px-3 py-3 text-center text-white sm:min-w-0 sm:px-4 sm:py-3.5"
              >
                <Icon
                  className="size-5 text-white"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-pretty text-[0.6875rem] font-medium leading-snug text-white/90 sm:text-xs">
                  {benefit.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
