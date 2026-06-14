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

export interface HomeHeroSlide {
  id: string;
  /** Banner completo solo imagen (sin textos superpuestos). */
  imageOnly?: boolean;
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
    id: 'ricoh-dia-papa',
    imageOnly: true,
    backgroundImage: '/hero/banner1.png',
    imageWidth: 1920,
    imageHeight: 538,
    imageAlt:
      'Feliz Día Papá — Lo mejor para él en Ricoh. Multifuncionales con tecnología que rinde, confiabilidad que avanza y soporte experto siempre.',
    linkHref: '/categoria/multifuncionales',
  },
];
