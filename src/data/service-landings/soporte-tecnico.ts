import {
  Calendar,
  Headphones,
  Package,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  Settings,
  Clock,
} from 'lucide-react';

import type { ServiceLandingConfig } from '@/types/service-landing';

export const soporteTecnicoLanding: ServiceLandingConfig = {
  slug: 'servicio-tecnico',
  metaTitle: 'Soporte técnico especializado',
  badge: 'Servicio técnico especializado',
  badgeIcon: Headphones,
  title: 'Soporte y mantenimiento para',
  titleHighlight: 'tu empresa',
  subtitle:
    'Atención técnica profesional para asegurar continuidad, rendimiento y respaldo en cada equipo.',
  bullets: ['Respuesta rápida', 'Cobertura integral', 'Planes flexibles'],
  gridCols: 'three',
  cards: [
    {
      id: 'preventivo',
      title: 'Mantenimiento Preventivo',
      description:
        'Revisiones programadas para evitar fallas y prolongar la vida útil de tus equipos.',
      image: '/services/servicio-tecnico/preventivo.png',
      imageAlt: 'Técnico realizando mantenimiento preventivo en impresora',
      icon: Shield,
    },
    {
      id: 'correctivo',
      title: 'Mantenimiento Correctivo',
      description: 'Reparación y solución de fallas con diagnóstico preciso y repuestos originales.',
      image: '/services/servicio-tecnico/correctivo.png',
      imageAlt: 'Técnico reparando equipo de impresión',
      icon: Wrench,
    },
    {
      id: 'general',
      title: 'Mantenimiento General',
      description: 'Servicio integral que combina revisión, ajuste y limpieza de componentes críticos.',
      image: '/services/servicio-tecnico/general.png',
      imageAlt: 'Mantenimiento general de equipos de oficina',
      icon: Settings,
    },
    {
      id: 'planes',
      title: 'Planes de Mantenimiento',
      description: 'Contratos personalizados con visitas periódicas y prioridad de atención.',
      image: '/services/servicio-tecnico/planes.png',
      imageAlt: 'Planificación de mantenimiento en tablet',
      icon: Calendar,
    },
    {
      id: 'suministro',
      title: 'Planes de Suministro',
      description: 'Abastecimiento programado de tóner, tinta y consumibles para tu flota.',
      image: '/services/servicio-tecnico/suministro.png',
      imageAlt: 'Cartuchos de tóner CMYK',
      icon: Package,
    },
    {
      id: 'garantia',
      title: 'Garantía Extendida',
      description: 'Cobertura ampliada más allá del fabricante con soporte local especializado.',
      image: '/services/servicio-tecnico/garantia.png',
      imageAlt: 'Garantía extendida en equipos Ricoh',
      icon: ShieldCheck,
    },
  ],
  benefits: [
    {
      id: 'rapida',
      title: 'Atención rápida',
      description: 'Soporte ágil cuando tu empresa lo necesite.',
      icon: Clock,
    },
    {
      id: 'expertos',
      title: 'Técnicos expertos',
      description: 'Personal capacitado y experiencia comprobada.',
      icon: Headphones,
    },
    {
      id: 'cobertura',
      title: 'Cobertura integral',
      description: 'Mantenimiento, suministros y respaldo en un solo lugar.',
      icon: ShieldCheck,
    },
    {
      id: 'flexibles',
      title: 'Planes flexibles',
      description: 'Opciones adaptadas al tamaño y operación de tu empresa.',
      icon: SlidersHorizontal,
    },
  ],
};
