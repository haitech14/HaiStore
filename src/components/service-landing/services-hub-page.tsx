import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ServiceHubTabList } from '@/components/service-landing/service-hub-tab-list';
import { ServiceLandingSection } from '@/components/service-landing/service-landing-section';
import type { ServiceLandingSlug } from '@/data/service-landings';
import {
  DEFAULT_SERVICE_HUB_SECTION,
  getServiceHubConfig,
  parseServiceHubSection,
} from '@/lib/service-hub';

export function ServicesHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = parseServiceHubSection(searchParams.get('seccion'));
  const config = getServiceHubConfig(activeSection);

  const selectSection = useCallback(
    (section: ServiceLandingSlug) => {
      if (section === DEFAULT_SERVICE_HUB_SECTION) {
        setSearchParams({}, { replace: true });
        return;
      }
      setSearchParams({ seccion: section }, { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (config) {
      document.title = `Servicios — ${config.metaTitle} | HaiStore`;
    }
  }, [config]);

  if (!config) {
    return null;
  }

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

      <div className="container relative flex flex-col gap-8 sm:gap-10">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-600 sm:text-xs">
            HaiStore
          </p>
          <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Servicios para tu empresa
          </h1>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Elige una categoría para ver soluciones de alquiler, soporte técnico, outsourcing y
            servicios corporativos.
          </p>
        </header>

        <ServiceHubTabList
          activeSection={activeSection}
          onSelect={selectSection}
          className="sticky top-16 z-20 -mx-1 rounded-xl border border-border/60 bg-background/95 px-2 py-3 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
        />

        <ServiceLandingSection config={config} sectionIdPrefix="servicios-hub" />
      </div>
    </div>
  );
}
