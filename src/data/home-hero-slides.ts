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
  eyebrow: string;
  titleLines: HomeHeroTitleLine[];
  subtitle: string;
  trustBadges: HomeHeroTrustBadge[];
  primaryCta:
    | { kind: 'whatsapp' }
    | { kind: 'link'; label: string; href: string; style?: 'green' | 'red' };
  secondaryCta: { label: string; href: string; external?: boolean };
  footerNote: string;
  backgroundImage: string;
  backgroundClass?: string;
  sealTitle: string;
  sealSubtitle: string;
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
    id: 'consumibles',
    eyebrow: 'Nueva generación de',
    titleLines: [
      { text: 'Equipos', variant: 'white' },
      { text: 'de Alto', variant: 'red' },
      { text: 'Rendimiento', variant: 'red' },
    ],
    subtitle: 'Tóner, Repuestos Originales y Compatibles, Servicio Técnico',
    trustBadges: [
      {
        icon: 'badge-check',
        title: '100% originales',
        text: 'Certificados por el fabricante.',
      },
      {
        icon: 'tag',
        title: 'Precios mayoristas',
        text: 'Descuentos desde la 1.ª unidad.',
      },
      {
        icon: 'truck',
        title: 'Despacho inmediato',
        text: 'Entrega en Lima en 24 h.',
      },
    ],
    primaryCta: { kind: 'whatsapp' },
    secondaryCta: { label: 'Ver catálogo', href: '/tienda' },
    footerNote: 'Garantía de fábrica · Compra segura',
    backgroundImage: '/hero-bg.png',
    sealTitle: 'Distribuidores\nautorizados',
    sealSubtitle: 'Consumibles certificados',
  },
  {
    id: 'promo-multifuncionales',
    eyebrow: 'Promoción de equipos',
    titleLines: [
      { text: 'Multifuncionales', variant: 'white' },
      { text: 'en Promoción', variant: 'red' },
    ],
    subtitle:
      'Imprime, escanea y copia con equipos Ricoh y más. Precios corporativos desde la primera unidad.',
    trustBadges: [
      {
        icon: 'percent',
        title: 'Hasta 21% dto.',
        text: 'En equipos seleccionados.',
      },
      {
        icon: 'badge-check',
        title: 'Equipos profesionales',
        text: 'Ricoh y marcas líderes.',
      },
      {
        icon: 'headset',
        title: 'Asesoría especializada',
        text: 'Cotización sin compromiso.',
      },
    ],
    primaryCta: {
      kind: 'link',
      label: 'Ver multifuncionales',
      href: '/categoria/multifuncionales',
      style: 'red',
    },
    secondaryCta: {
      label: 'Cotizar por WhatsApp',
      href: HOME_HERO_WHATSAPP_LINK,
      external: true,
    },
    footerNote: 'Stock disponible · Instalación en Lima',
    backgroundImage: '/hero/hero-slide-promo-equipos.png',
    sealTitle: 'Oferta corporativa',
    sealSubtitle: 'Multifuncionales Ricoh',
  },
  {
    id: 'alquiler-equipos',
    eyebrow: 'Servicios empresariales',
    titleLines: [
      { text: 'Alquiler de', variant: 'white' },
      { text: 'Equipos', variant: 'red' },
    ],
    subtitle:
      'Impresoras, plotters, laptops y más con mantenimiento incluido. Ideal para proyectos y operación temporal.',
    trustBadges: [
      {
        icon: 'key',
        title: 'Sin inversión inicial',
        text: 'Cuota mensual predecible.',
      },
      {
        icon: 'truck',
        title: 'Instalación incluida',
        text: 'Puesta en marcha en Lima.',
      },
      {
        icon: 'shield',
        title: 'Mantenimiento',
        text: 'Soporte técnico HaiTech.',
      },
    ],
    primaryCta: {
      kind: 'link',
      label: 'Ver alquiler',
      href: '/servicios',
      style: 'red',
    },
    secondaryCta: { label: 'Solicitar cotización', href: '/contacto' },
    footerNote: 'Planes flexibles · Contratos a medida',
    backgroundImage: '/hero/hero-slide-alquiler.png',
    sealTitle: 'HaiTech Rental',
    sealSubtitle: 'Equipos listos para operar',
  },
  {
    id: 'promo-seminuevas',
    eyebrow: 'Ahorra en equipos',
    titleLines: [
      { text: 'Impresoras', variant: 'white' },
      { text: 'Seminuevas', variant: 'red' },
    ],
    subtitle:
      'Equipos revisados en excelente estado operativo. Ideal para flotas pequeñas y presupuestos ajustados.',
    trustBadges: [
      {
        icon: 'tag',
        title: 'Mejor precio',
        text: 'Alternativa económica certificada.',
      },
      {
        icon: 'badge-check',
        title: 'Revisión HaiTech',
        text: 'Control de calidad previo.',
      },
      {
        icon: 'headset',
        title: 'Soporte incluido',
        text: 'Asesoría postventa local.',
      },
    ],
    primaryCta: {
      kind: 'link',
      label: 'Ver seminuevas',
      href: '/categoria/multifuncionales?sub=multifuncionales-seminuevas',
      style: 'red',
    },
    secondaryCta: { label: 'Ver catálogo', href: '/tienda' },
    footerNote: 'Garantía de funcionamiento · Entrega programada',
    backgroundImage: '/promotions/promo-hero-multifuncionales.png',
    backgroundClass: 'bg-cover bg-center',
    sealTitle: 'Equipos revisados',
    sealSubtitle: 'Listos para operar',
  },
];
