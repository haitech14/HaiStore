import type { LucideIcon } from 'lucide-react';

import {
  alquilerLanding,
  outsourcingLanding,
  serviciosCorporativosLanding,
  soporteTecnicoLanding,
  type ServiceLandingSlug,
} from '@/data/service-landings';
import { categoryPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import type { ServiceLandingConfig } from '@/types/service-landing';

export interface EnterpriseServiceCarouselItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  imageBgClass: string;
  detailHref: string;
}

const IMAGE_BG_CLASSES = [
  'bg-sky-500',
  'bg-sky-600',
  'bg-indigo-500',
  'bg-blue-600',
  'bg-cyan-600',
  'bg-teal-600',
  'bg-violet-600',
  'bg-slate-600',
  'bg-red-600/90',
  'bg-emerald-600',
] as const;

function detailHrefForCard(landing: ServiceLandingConfig, cardId: string): string {
  if (landing.slug === 'alquiler') {
    return categoryPath('alquiler', `alquiler-${cardId}`);
  }
  return serviceHubPath(landing.slug as ServiceLandingSlug);
}

function mapLandingToCarouselItems(
  landing: ServiceLandingConfig,
  sectionOffset: number,
): EnterpriseServiceCarouselItem[] {
  return landing.cards.map((card, index) => ({
    id: `${landing.slug}-${card.id}`,
    title: card.title,
    description: card.description,
    icon: card.icon,
    image: card.image,
    imageAlt: card.imageAlt,
    imageBgClass: IMAGE_BG_CLASSES[(sectionOffset + index) % IMAGE_BG_CLASSES.length],
    detailHref: detailHrefForCard(landing, card.id),
  }));
}

export const enterpriseServiceCarouselItems: EnterpriseServiceCarouselItem[] = [
  ...mapLandingToCarouselItems(alquilerLanding, 0),
  ...mapLandingToCarouselItems(soporteTecnicoLanding, 6),
  ...mapLandingToCarouselItems(outsourcingLanding, 12),
  ...mapLandingToCarouselItems(serviciosCorporativosLanding, 16),
];
