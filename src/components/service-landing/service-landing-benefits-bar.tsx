import type { ServiceLandingBenefit } from '@/types/service-landing';

interface ServiceLandingBenefitsBarProps {
  benefits: readonly ServiceLandingBenefit[];
}

export function ServiceLandingBenefitsBar({ benefits }: ServiceLandingBenefitsBarProps) {
  return (
    <section
      aria-label="Beneficios del servicio"
      className="rounded-2xl border border-border/60 bg-card px-4 py-6 shadow-sm sm:px-6 sm:py-8"
    >
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <li key={benefit.id} className="flex gap-3 sm:gap-4">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-sky-600/30 bg-sky-50 text-sky-700"
                aria-hidden="true"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {benefit.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
