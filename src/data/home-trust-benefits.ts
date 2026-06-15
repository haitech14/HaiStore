import { BadgeCheck, Headphones, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

export interface HomeTrustBenefit {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const HOME_TRUST_BENEFITS: HomeTrustBenefit[] = [
  {
    id: 'originales',
    title: 'Equipos 100% originales',
    description: 'Garantía y respaldo oficial Ricoh',
    icon: ShieldCheck,
  },
  {
    id: 'envios',
    title: 'Envíos a todo el país',
    description: 'Rápido y seguro',
    icon: Truck,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico especializado',
    description: 'Te acompañamos siempre',
    icon: Headphones,
  },
  {
    id: 'compra-segura',
    title: 'Compra segura',
    description: 'Cotiza y compra con confianza',
    icon: BadgeCheck,
  },
];
