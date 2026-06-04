import { alquilerLanding } from '@/data/service-landings/alquiler';
import { outsourcingLanding } from '@/data/service-landings/outsourcing';
import { serviciosCorporativosLanding } from '@/data/service-landings/servicios-corporativos';
import { soporteTecnicoLanding } from '@/data/service-landings/soporte-tecnico';
import type { ServiceLandingConfig } from '@/types/service-landing';

export const SERVICE_LANDING_SLUGS = [
  'alquiler',
  'servicio-tecnico',
  'outsourcing',
  'servicios-corporativos',
] as const;

export type ServiceLandingSlug = (typeof SERVICE_LANDING_SLUGS)[number];

const landingsBySlug: Record<ServiceLandingSlug, ServiceLandingConfig> = {
  alquiler: alquilerLanding,
  'servicio-tecnico': soporteTecnicoLanding,
  outsourcing: outsourcingLanding,
  'servicios-corporativos': serviciosCorporativosLanding,
};

export function getServiceLandingBySlug(slug: string): ServiceLandingConfig | undefined {
  return landingsBySlug[slug as ServiceLandingSlug];
}

export {
  alquilerLanding,
  soporteTecnicoLanding,
  outsourcingLanding,
  serviciosCorporativosLanding,
};
