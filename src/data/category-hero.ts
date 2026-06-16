import { resolveSubcategoryHeroImage } from '@/lib/subcategory-product-image';
import { subcategoryVisualKind, type SubcategoryVisualKind } from '@/lib/subcategory-visual';
import { formatSubcategoryTabLabel } from '@/lib/store-category-display';
import type { Product } from '@/types/product';

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
    title: 'Suministros',
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

const DEFAULT_FEATURES: CategoryHeroFeature[] = [
  { icon: 'badge-percent', label: 'Precios corporativos' },
  { icon: 'printer', label: 'Equipos profesionales' },
  { icon: 'headset', label: 'Asesoría especializada' },
];

const SUBCATEGORY_HERO_BY_KIND: Record<
  Extract<SubcategoryVisualKind, 'new' | 'preowned' | 'refurbished'>,
  { badge?: string; subtitle: string }
> = {
  new: {
    badge: 'HASTA 21% DTO.',
    subtitle:
      'Equipos Ricoh y más, nuevos de fábrica con garantía y precios corporativos desde la primera unidad.',
  },
  preowned: {
    badge: 'Revisados',
    subtitle:
      'Equipos seminuevos certificados con excelente relación calidad-precio y soporte técnico incluido.',
  },
  refurbished: {
    badge: 'Garantía HaiStore',
    subtitle:
      'Reacondicionados profesionalmente con rendimiento garantizado y precios accesibles para tu oficina.',
  },
};

export interface SubcategoryHeroSource {
  name: string;
  slug: string;
  tagline?: string | null | undefined;
  image?: string | null | undefined;
  inventoryLabels?: string[] | undefined;
}

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

export function getSubcategoryHeroContent(
  parentSlug: string,
  sub: SubcategoryHeroSource,
  parentFallback: { name: string; tagline: string; image?: string },
  products: Product[] = [],
): ResolvedCategoryHero {
  const parentHero = getCategoryHeroContent(parentSlug, parentFallback);
  const kind = subcategoryVisualKind(sub.name);
  const kindContent =
    kind === 'new' || kind === 'preowned' || kind === 'refurbished'
      ? SUBCATEGORY_HERO_BY_KIND[kind]
      : null;

  const shortTitle = formatSubcategoryTabLabel(sub.name, parentFallback.name);
  const image = resolveSubcategoryHeroImage(
    {
      name: sub.name,
      slug: sub.slug,
      ...(sub.image != null ? { image: sub.image } : {}),
      ...(sub.inventoryLabels ? { inventoryLabels: sub.inventoryLabels } : {}),
    },
    products,
    parentHero.image,
  );

  const resolved: ResolvedCategoryHero = {
    title: sub.name,
    subtitle: sub.tagline?.trim() || kindContent?.subtitle || parentHero.subtitle,
    image,
    imageAlt: `Equipos ${shortTitle.toLowerCase()} de ${parentFallback.name}`,
    features: parentHero.features.length > 0 ? parentHero.features : DEFAULT_FEATURES,
  };

  if (kindContent?.badge) resolved.badge = kindContent.badge;

  return resolved;
}
