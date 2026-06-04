import { ServiceLandingBenefitsBar } from '@/components/service-landing/service-landing-benefits-bar';
import { ServiceLandingCardTile } from '@/components/service-landing/service-landing-card';
import { ServiceLandingHero } from '@/components/service-landing/service-landing-hero';
import type { ServiceLandingConfig } from '@/types/service-landing';
import { cn } from '@/lib/utils';

interface ServiceLandingSectionProps {
  config: ServiceLandingConfig;
  sectionIdPrefix?: string;
}

export function ServiceLandingSection({
  config,
  sectionIdPrefix = 'servicios',
}: ServiceLandingSectionProps) {
  const gridClass =
    config.gridCols === 'two'
      ? 'mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const panelId = `${sectionIdPrefix}-panel-${config.slug}`;
  const titleId = `${config.slug}-servicios-titulo`;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={`${sectionIdPrefix}-tab-${config.slug}`}
      className="flex flex-col gap-10 sm:gap-12"
    >
      <ServiceLandingHero config={config} />

      <section aria-labelledby={titleId}>
        <h2 id={titleId} className="sr-only">
          Servicios de {config.metaTitle}
        </h2>
        <ul className={cn('grid gap-5 sm:gap-6', gridClass)} role="list">
          {config.cards.map((card) => (
            <li key={card.id} className="flex">
              <ServiceLandingCardTile card={card} />
            </li>
          ))}
        </ul>
      </section>

      <ServiceLandingBenefitsBar benefits={config.benefits} />
    </div>
  );
}
