import { HOME_TRUST_BENEFITS } from '@/data/home-trust-benefits';
import { cn } from '@/lib/utils';

export function HomeTrustStrip() {
  return (
    <section
      aria-label="Beneficios y garantías HaiStore"
      className="border-t border-border/60 bg-white"
    >
      <div className="container py-6 sm:py-8">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {HOME_TRUST_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li
                key={benefit.id}
                className="flex items-start gap-3 sm:gap-4"
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-red-600 text-red-600',
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-pretty text-sm font-bold leading-snug text-[#0f1f3d] sm:text-base">
                    {benefit.title}
                  </p>
                  <p className="mt-0.5 text-pretty text-xs leading-snug text-muted-foreground sm:text-sm">
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
