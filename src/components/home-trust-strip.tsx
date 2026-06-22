import { HOME_TRUST_BENEFITS } from '@/data/home-trust-benefits';

export function HomeTrustStrip() {
  return (
    <section aria-label="Beneficios y garantías HaiStore">
      <div className="container pb-4 sm:pb-5">
        <div className="rounded-2xl border border-border/60 bg-white px-4 py-5 shadow-[0_2px_12px_rgba(15,31,61,0.06)] sm:px-6 sm:py-6">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-4">
            {HOME_TRUST_BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.id} className="flex items-start gap-3 sm:gap-3.5">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center text-muted-foreground sm:size-11"
                    aria-hidden="true"
                  >
                    <Icon className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
                  </span>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-pretty text-sm font-bold leading-snug text-[#0f1f3d] sm:text-[0.9375rem]">
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
      </div>
    </section>
  );
}
