import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Headphones,
  KeyRound,
  Laptop,
  Package,
  Printer,
  Shield,
  Star,
  Wrench,
} from 'lucide-react';

import { categoryPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export type MegaMenuSectionId =
  | 'impresion'
  | 'suministros'
  | 'tecnologia'
  | 'servicios'
  | 'destacados';

export const megaMenuSectionMeta: Record<
  MegaMenuSectionId,
  { label: string; description: string; icon: LucideIcon }
> = {
  impresion: {
    label: 'Impresión',
    description: 'Multifuncionales, impresoras, escáneres y formato ancho.',
    icon: Printer,
  },
  suministros: {
    label: 'Suministros',
    description: 'Tóner, repuestos, alquiler y consumibles certificados.',
    icon: Package,
  },
  tecnologia: {
    label: 'Tecnología',
    description: 'Computadoras, monitores y soluciones para tu oficina.',
    icon: Laptop,
  },
  servicios: {
    label: 'Servicios',
    description: 'Alquiler, soporte técnico, outsourcing y soluciones corporativas.',
    icon: Wrench,
  },
  destacados: {
    label: 'Destacados',
    description: 'Accesos rápidos a las categorías más consultadas.',
    icon: Star,
  },
};

export const megaMenuFeatured = {
  title: 'Soluciones para oficina',
  description: 'Equipos, tóners y repuestos con atención especializada.',
  cta: 'Ver catálogo',
  href: '/tienda',
  image: '/hero-bg.png',
  imageAlt: 'Multifuncional y laptop para oficina',
};

export interface MegaMenuPlatformLink {
  id: string;
  href: string;
  logoUrl?: string;
  logoAlt: string;
  brandPrefix: string;
  brandSuffix: string;
  description: string;
  icon?: LucideIcon;
  external?: boolean;
}

export const megaMenuPlatforms: readonly MegaMenuPlatformLink[] = [
  {
    id: 'haisupport',
    href: 'https://soporte.haitech.pe/',
    logoUrl: '/logos/haisupport-logo.png',
    logoAlt: 'HaiSupport',
    brandPrefix: 'Hai',
    brandSuffix: 'Support',
    description: 'Gestión de soporte técnico y alquiler',
    external: true,
  },
  {
    id: 'haisales',
    href: 'https://ventas.haitech.pe/',
    logoUrl: '/logos/haisales-logo.png',
    logoAlt: 'HAISales — Desarrollado por HAITECH ERP',
    brandPrefix: 'Hai',
    brandSuffix: 'Sales',
    description: 'ERP, facturación y CRM empresarial',
    external: true,
  },
  {
    id: 'hairent',
    href: categoryPath('alquiler'),
    logoAlt: 'Alquiler de Equipos',
    brandPrefix: 'Alquiler',
    brandSuffix: ' de Equipos',
    description: 'Equipos en modalidad mensual',
    icon: KeyRound,
    external: false,
  },
  {
    id: 'haiprotect',
    href: '/haiprotect',
    logoAlt: 'HaiProtect',
    brandPrefix: 'Hai',
    brandSuffix: 'Protect',
    description: 'Garantía extendida y protección',
    icon: Shield,
    external: false,
  },
];

export interface MegaMenuServiceLink {
  slug: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const megaMenuServiceLinks: readonly MegaMenuServiceLink[] = [
  {
    slug: 'alquiler',
    label: 'Alquiler',
    description: 'Equipos flexibles para tu operación',
    href: serviceHubPath('alquiler'),
    icon: KeyRound,
  },
  {
    slug: 'servicio-tecnico',
    label: 'Soporte Técnico',
    description: 'Mantenimiento y reparación especializada',
    href: serviceHubPath('servicio-tecnico'),
    icon: Headphones,
  },
  {
    slug: 'outsourcing',
    label: 'Outsourcing',
    description: 'Personal y gestión operativa',
    href: serviceHubPath('outsourcing'),
    icon: Briefcase,
  },
  {
    slug: 'servicios-corporativos',
    label: 'Servicios Corporativos',
    description: 'Eventos, digital y capacitación',
    href: serviceHubPath('servicios-corporativos'),
    icon: Wrench,
  },
];

export interface MegaMenuHighlightCategory {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  href: string;
}

export const megaMenuHighlightCategories: readonly MegaMenuHighlightCategory[] = [
  {
    slug: 'multifuncionales',
    name: 'Multifuncionales',
    tagline: 'Imprime, escanea y copia',
    image: '/categories/multifuncionales.png',
    href: categoryPath('multifuncionales'),
  },
  {
    slug: 'toner-suministros',
    name: 'Suministros',
    tagline: 'Originales y compatibles',
    image: '/categories/toner-suministros.png',
    href: categoryPath('toner-suministros'),
  },
  {
    slug: 'repuestos',
    name: 'Repuestos',
    tagline: 'Partes y componentes',
    image: '/categories/repuestos.png',
    href: categoryPath('repuestos'),
  },
  {
    slug: 'alquiler',
    name: 'Alquiler',
    tagline: 'Equipos mensuales',
    image: '/categories/alquiler.png',
    href: categoryPath('alquiler'),
  },
  {
    slug: 'servicio-tecnico',
    name: 'Servicio Técnico',
    tagline: 'Soporte especializado',
    image: '/categories/servicio-tecnico.png',
    href: categoryPath('servicio-tecnico'),
  },
  {
    slug: 'computadoras-laptop',
    name: 'Computadoras',
    tagline: 'Laptops y desktops',
    image: '/categories/computadoras-laptop.png',
    href: categoryPath('computadoras-laptop'),
  },
];

/** Imagen de categoría por slug (subcategorías incluidas). */
export const megaMenuCategoryImages: Record<string, string> = {
  multifuncionales: '/categories/multifuncionales.png',
  impresoras: '/categories/impresoras.png',
  'formato-ancho': '/categories/formato-ancho.png',
  'toner-suministros': '/categories/toner-suministros.png',
  toner: '/categories/toner-suministros.png',
  repuestos: '/categories/repuestos.png',
  'servicio-tecnico': '/categories/servicio-tecnico.png',
  escaneres: '/categories/escaneres.png',
  alquiler: '/categories/alquiler.png',
  tecnologia: '/categories/computadoras-laptop.png',
  accesorios: '/categories/accesorios-impresoras.png',
  monitores: '/categories/monitores.png',
  'computadoras-laptop': '/categories/computadoras-laptop.png',
  'soluciones-colaboracion': '/categories/soluciones-colaboracion.png',
  'soluciones-negocio': '/categories/soluciones-negocio.png',
};

export function megaMenuImageForSlug(slug: string): string | undefined {
  if (megaMenuCategoryImages[slug]) return megaMenuCategoryImages[slug];
  const root = slug.split('-')[0];
  return megaMenuCategoryImages[root];
}
