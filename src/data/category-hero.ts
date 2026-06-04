export type CategoryHeroFeatureIcon = 'badge-percent' | 'printer' | 'headset';

export interface CategoryHeroFeature {
  icon: CategoryHeroFeatureIcon;
  label: string;
}

export interface CategoryHeroPromoCard {
  title: string;
  subtitle: string;
}

export interface CategoryHeroContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  features?: CategoryHeroFeature[];
  promoCard?: CategoryHeroPromoCard;
}

export interface ResolvedCategoryHero {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  badge?: string;
  features: CategoryHeroFeature[];
  promoCard?: CategoryHeroPromoCard;
}

export const categoryHeroBySlug: Record<string, CategoryHeroContent> = {
  multifuncionales: {
    badge: 'HASTA 21% DTO.',
    title: 'Multifuncionales en promoción',
    subtitle:
      'Imprime, escanea y copia con equipos Ricoh y más. Precios corporativos desde la primera unidad.',
    image: '/promotions/promo-hero-multifuncionales.png',
    imageAlt: 'Impresora multifuncional de oficina en promoción',
    features: [
      { icon: 'badge-percent', label: 'Precios corporativos' },
      { icon: 'printer', label: 'Equipos profesionales' },
      { icon: 'headset', label: 'Asesoría especializada' },
    ],
    promoCard: {
      title: 'Ahorra más',
      subtitle: 'Descuentos exclusivos por tiempo limitado.',
    },
  },
  impresoras: {
    badge: 'Novedades',
    title: 'Impresoras para cada oficina',
    subtitle: 'Láser, inkjet y equipos de alto volumen con soporte técnico HaiStore.',
    image: '/promotions/promo-hero-ofertas.png',
    imageAlt: 'Impresoras de oficina',
  },
  'toner-suministros': {
    badge: 'Stock disponible',
    title: 'Tóner y suministros',
    subtitle: 'Consumibles originales y compatibles para mantener tu flota operativa.',
    image: '/promotions/promo-hero-ofertas.png',
    imageAlt: 'Suministros de impresión',
  },
  alquiler: {
    badge: 'Planes flexibles',
    title: 'Alquiler de equipos',
    subtitle:
      'Impresoras, plotters, laptops y más con mantenimiento incluido. Ideal para proyectos y operación temporal.',
    image: '/categories/alquiler.png',
    imageAlt: 'Equipos de oficina disponibles en modalidad de alquiler',
    features: [
      { icon: 'printer', label: 'Equipos Ricoh y aliados' },
      { icon: 'headset', label: 'Instalación y soporte' },
      { icon: 'badge-percent', label: 'Cotización a medida' },
    ],
  },
};

export function getCategoryHeroContent(
  slug: string,
  fallback: { name: string; tagline: string; image?: string },
): ResolvedCategoryHero {
  const custom = categoryHeroBySlug[slug];
  const resolved: ResolvedCategoryHero = {
    title: custom?.title ?? `${fallback.name} en HaiStore`,
    subtitle: custom?.subtitle ?? fallback.tagline,
    image: custom?.image ?? fallback.image ?? '/promotions/promo-hero-ofertas.png',
    imageAlt: custom?.imageAlt ?? `Equipos y productos de ${fallback.name}`,
    features: custom?.features ?? [],
  };
  if (custom?.badge) resolved.badge = custom.badge;
  if (custom?.promoCard) resolved.promoCard = custom.promoCard;
  return resolved;
}
