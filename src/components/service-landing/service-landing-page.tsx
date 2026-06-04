import { ServiceLandingSection } from '@/components/service-landing/service-landing-section';
import type { ServiceLandingConfig } from '@/types/service-landing';

interface ServiceLandingPageViewProps {
  config: ServiceLandingConfig;
}

export function ServiceLandingPageView({ config }: ServiceLandingPageViewProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background pb-12 pt-8 sm:pb-16 sm:pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border)/0.35)_1px,transparent_0)] [background-size:24px_24px] opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-sky-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-32 size-80 rounded-full bg-indigo-100/50 blur-3xl"
      />

      <div className="container relative">
        <ServiceLandingSection config={config} />
      </div>
    </div>
  );
}
