import type { LucideIcon } from 'lucide-react';
import { Laptop, Package, Printer, Star } from 'lucide-react';

export type MegaMenuSectionId = 'impresion' | 'suministros' | 'tecnologia' | 'destacados';

export const megaMenuSidebar: {
  id: MegaMenuSectionId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'impresion', label: 'Impresión', icon: Printer },
  { id: 'suministros', label: 'Suministros', icon: Package },
  { id: 'tecnologia', label: 'Tecnología', icon: Laptop },
  { id: 'destacados', label: 'Destacados', icon: Star },
];

export const megaMenuFeatured = {
  title: 'Soluciones para oficina',
  description: 'Equipos, tóners y repuestos con atención especializada.',
  cta: 'Ver catálogo',
  href: '/tienda',
  image: '/hero-bg.png',
  imageAlt: 'Multifuncional y laptop para oficina',
};
