import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { ServiceLandingPageView } from '@/components/service-landing/service-landing-page';
import { getServiceLandingBySlug, type ServiceLandingSlug } from '@/data/service-landings';

interface ServiceLandingRouteProps {
  slug: ServiceLandingSlug;
}

export function ServiceLandingRoute({ slug }: ServiceLandingRouteProps) {
  const config = getServiceLandingBySlug(slug);

  useEffect(() => {
    if (config) {
      document.title = `${config.metaTitle} | HaiStore`;
    }
  }, [config]);

  if (!config) {
    return <Navigate to="/" replace />;
  }

  return <ServiceLandingPageView config={config} />;
}

export function AlquilerLandingPage() {
  return <ServiceLandingRoute slug="alquiler" />;
}

export function SoporteTecnicoLandingPage() {
  return <ServiceLandingRoute slug="servicio-tecnico" />;
}

export function OutsourcingLandingPage() {
  return <ServiceLandingRoute slug="outsourcing" />;
}

export function ServiciosCorporativosLandingPage() {
  return <ServiceLandingRoute slug="servicios-corporativos" />;
}
