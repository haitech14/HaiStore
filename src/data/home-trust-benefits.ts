import {
  BadgeCheck,
  FileText,
  MessageCircle,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface HomeTrustBenefit {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const HOME_TRUST_BENEFITS: HomeTrustBenefit[] = [
  { id: 'ricoh-partner', label: 'Partner Ricoh autorizado', icon: BadgeCheck },
  { id: 'garantia', label: 'Garantía de funcionamiento', icon: ShieldCheck },
  { id: 'delivery', label: 'Delivery e instalación', icon: Truck },
  { id: 'factura', label: 'Factura para empresas', icon: FileText },
  { id: 'soporte', label: 'Soporte técnico local', icon: Wrench },
  { id: 'whatsapp', label: 'Atención por WhatsApp', icon: MessageCircle },
];
