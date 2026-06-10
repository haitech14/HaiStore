import {
  BadgeCheck,
  Building2,
  MapPin,
  Package,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface HomeTrustBenefit {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const HOME_TRUST_BENEFITS: HomeTrustBenefit[] = [
  {
    id: 'ricoh-alliance',
    title: 'Distribuidor RICOH',
    description: 'Canal Alliance Partner autorizado',
    icon: BadgeCheck,
  },
  {
    id: 'peru-compras',
    title: 'Peru Compras',
    description: 'Proveedor autorizado del Estado',
    icon: Building2,
  },
  {
    id: 'locales-garantia',
    title: 'Lima y Piura',
    description: 'Local físico y garantía 100%',
    icon: MapPin,
  },
  {
    id: 'soporte-certificado',
    title: 'Soporte técnico propio',
    description: 'Certificado por la marca',
    icon: Wrench,
  },
  {
    id: 'stock-almacenes',
    title: '+1 000 equipos en stock',
    description: 'Disponibles en nuestros almacenes',
    icon: Package,
  },
  {
    id: 'envios-diarios',
    title: 'Envíos diarios',
    description: 'Despachos todos los días',
    icon: Truck,
  },
];
