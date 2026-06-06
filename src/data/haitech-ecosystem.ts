import type { LucideIcon } from 'lucide-react';
import { KeyRound, Shield } from 'lucide-react';

import { categoryPath } from '@/lib/category-path';

export interface HaitechEcosystemBanner {
  id: string;
  brandPrefix: string;
  brandSuffix: string;
  description: string;
  href: string;
  ctaLabel: string;
  image: string;
  imageAlt: string;
  icon?: LucideIcon;
  logoUrl?: string;
  logoAlt?: string;
  variant: 'support' | 'sales' | 'rent' | 'protect';
  external?: boolean;
}

export const HAITECH_ECOSYSTEM_BANNERS: readonly HaitechEcosystemBanner[] = [
  {
    id: 'haisupport',
    brandPrefix: 'Hai',
    brandSuffix: 'Support',
    description: 'Sistema de Gestión Integral de Soporte Técnico y de Alquiler',
    href: 'https://soporte.haitech.pe/',
    ctaLabel: 'Ir a HaiSupport',
    image: '/promotions/promo-hero-servicio.png',
    imageAlt: 'Técnico de soporte atendiendo equipos de impresión',
    logoUrl: '/logos/haisupport-logo.png',
    logoAlt: 'HaiSupport — Desarrollado por HAITECH',
    variant: 'support',
    external: true,
  },
  {
    id: 'haisales',
    brandPrefix: 'Hai',
    brandSuffix: 'Sales',
    description: 'Sistema ERP, Facturación y CRM Empresarial',
    href: 'https://ventas.haitech.pe/',
    ctaLabel: 'Ir a HaiSales',
    image: '/promo-cards/b2b-printer.png',
    imageAlt: 'Equipo de oficina y soluciones empresariales',
    logoUrl: '/logos/haisales-logo.png',
    logoAlt: 'HAISales — Desarrollado por HAITECH ERP',
    variant: 'sales',
    external: true,
  },
  {
    id: 'hairent',
    brandPrefix: 'Alquiler',
    brandSuffix: ' de Equipos',
    description: 'Equipos de impresión y tecnología en modalidad de alquiler mensual',
    href: categoryPath('alquiler'),
    ctaLabel: 'Ver Alquiler de Equipos',
    image: '/categories/alquiler.png',
    imageAlt: 'Impresora y laptop disponibles en modalidad de alquiler',
    icon: KeyRound,
    variant: 'rent',
    external: false,
  },
  {
    id: 'haiprotect',
    brandPrefix: 'Hai',
    brandSuffix: 'Protect',
    description: 'Protección integral y garantía extendida para equipos de impresión',
    href: '/haiprotect',
    ctaLabel: 'Ir a HaiProtect',
    image: '/services/servicio-tecnico/garantia.png',
    imageAlt: 'Garantía extendida y protección de equipos Ricoh',
    icon: Shield,
    variant: 'protect',
    external: false,
  },
] as const;
