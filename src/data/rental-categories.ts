import type { LucideIcon } from 'lucide-react';
import { Laptop, Monitor, Printer, Projector, Ruler, ScanLine } from 'lucide-react';

export interface RentalCategory {
  slug: string;
  name: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  /** Fondo del área superior de la tarjeta (HSL del tema o gradiente Tailwind). */
  imageBgClass: string;
}

export const RENTAL_PARENT_SLUG = 'alquiler';

export const rentalCategories: RentalCategory[] = [
  {
    slug: 'alquiler-laptops',
    name: 'Laptops',
    title: 'Alquiler de Laptops',
    description:
      'Equipos modernos y configurados según tus necesidades, perfectos para oficinas, capacitaciones o conferencias.',
    icon: Laptop,
    image: '/services/alquiler/laptops.png',
    imageAlt: 'Laptop profesional lista para alquiler corporativo',
    imageBgClass: 'bg-sky-500',
  },
  {
    slug: 'alquiler-computadoras',
    name: 'Computadoras',
    title: 'Alquiler de Computadoras',
    description:
      'Ideales para trabajos continuos de oficina, diseño o producción. Rendimiento y estabilidad garantizados.',
    icon: Monitor,
    image: '/services/alquiler/computadoras.png',
    imageAlt: 'Estación de trabajo de escritorio para alquiler',
    imageBgClass: 'bg-sky-600',
  },
  {
    slug: 'alquiler-proyectores',
    name: 'Proyectores',
    title: 'Alquiler de Proyectores',
    description:
      'Opciones láser o LED para salas de reuniones y eventos. Incluye instalación, cableado y soporte técnico.',
    icon: Projector,
    image: '/categories/alquiler/proyectores.png',
    imageAlt: 'Sala de reuniones con proyector instalado',
    imageBgClass: 'bg-indigo-500',
  },
  {
    slug: 'alquiler-impresoras',
    name: 'Impresoras',
    title: 'Alquiler de Impresoras',
    description:
      'Multifuncionales y equipos de oficina con mantenimiento incluido. Planes flexibles por volumen de impresión.',
    icon: Printer,
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora multifuncional de oficina en alquiler',
    imageBgClass: 'bg-blue-600',
  },
  {
    slug: 'alquiler-plotters',
    name: 'Plotters',
    title: 'Alquiler de Plotters',
    description:
      'Equipos de alta precisión para impresión técnica o gráfica. Ideal para empresas de arquitectura e ingeniería.',
    icon: Ruler,
    image: '/services/alquiler/plotters.png',
    imageAlt: 'Plotter de formato ancho para planos y diseño',
    imageBgClass: 'bg-cyan-600',
  },
  {
    slug: 'alquiler-escaneres',
    name: 'Escáneres',
    title: 'Alquiler de Escáneres',
    description:
      'Digitalización de documentos a gran velocidad. Soluciones de cama plana o alimentador automático.',
    icon: ScanLine,
    image: '/services/alquiler/escaneres.png',
    imageAlt: 'Escáner de documentos para digitalización empresarial',
    imageBgClass: 'bg-teal-600',
  },
];

export function findRentalCategoryBySlug(slug: string): RentalCategory | undefined {
  return rentalCategories.find((entry) => entry.slug === slug);
}
