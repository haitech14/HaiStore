import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Headphones, KeyRound, Percent, ShieldCheck, Tag, Truck } from 'lucide-react';

export type HomeHeroTrustIcon =
  | 'badge-check'
  | 'tag'
  | 'truck'
  | 'shield'
  | 'percent'
  | 'key'
  | 'headset';

export interface HomeHeroTrustBadge {
  icon: HomeHeroTrustIcon;
  title: string;
  text: string;
}

export interface HomeHeroTitleLine {
  text: string;
  variant: 'white' | 'red';
}

export type HomeHeroSlideLayout = 'image-only' | 'dia-papa-home';

export interface HomeHeroSlide {
  id: string;
  layout?: HomeHeroSlideLayout;
  /** Banner completo solo imagen (sin textos superpuestos). */
  imageOnly?: boolean;
  /** Una sola imagen en `backgroundImage` (sin variantes @2x/@3x). */
  singleAsset?: boolean;
  /** Altura acorde al carrusel de categorías; ancho natural (no full-bleed). */
  compact?: boolean;
  linkHref?: string;
  imageAlt?: string;
  eyebrow?: string;
  titleLines?: HomeHeroTitleLine[];
  subtitle?: string;
  trustBadges?: HomeHeroTrustBadge[];
  primaryCta?:
    | { kind: 'whatsapp' }
    | { kind: 'link'; label: string; href: string; style?: 'green' | 'red' };
  secondaryCta?: { label: string; href: string; external?: boolean };
  footerNote?: string;
  backgroundImage: string;
  imageWidth?: number;
  imageHeight?: number;
  imageBackground?: string;
  backgroundClass?: string;
  sealTitle?: string;
  sealSubtitle?: string;
}

export const HOME_HERO_WHATSAPP_NUMBER = '915 149 290';
export const HOME_HERO_WHATSAPP_LINK = 'https://wa.me/51915149290';

export const TRUST_ICON_MAP: Record<HomeHeroTrustIcon, LucideIcon> = {
  'badge-check': BadgeCheck,
  tag: Tag,
  truck: Truck,
  shield: ShieldCheck,
  percent: Percent,
  key: KeyRound,
  headset: Headphones,
};

export const homeHeroSlides: HomeHeroSlide[] = [
  {
    id: 'dia-papa-ricoh-promo',
    imageOnly: true,
    singleAsset: true,
    compact: true,
    backgroundImage: '/categories/banner2.png',
    imageWidth: 2172,
    imageHeight: 724,
    imageAlt:
      'Día del Padre — Promociones especiales en fotocopiadoras Ricoh IM 550F, IM C2010 e IM 430F. Potencia tu oficina con rendimiento, velocidad y calidad profesional.',
    linkHref: HOME_HERO_WHATSAPP_LINK,
  },
];
