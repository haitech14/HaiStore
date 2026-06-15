import {
  ClipboardList,
  FileText,
  Headphones,
  Search,
  Shield,
  Truck,
  type LucideIcon,
} from 'lucide-react';

export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
  icon: LucideIcon;
}

/** Orden en grilla 2×3: columna izquierda primero, luego derecha. */
export const HOME_FAQ_ITEMS: readonly HomeFaqItem[] = [
  {
    id: 'garantia',
    question: '¿Los equipos tienen garantía?',
    answer:
      'Sí. Los equipos nuevos incluyen garantía oficial del fabricante. Los seminuevos y remanufacturados se entregan con revisión técnica HaiTech y garantía documentada según el modelo y la condición del equipo.',
    icon: Shield,
  },
  {
    id: 'delivery',
    question: '¿Hacen delivery e instalación?',
    answer:
      'Sí. Realizamos entregas en Lima Metropolitana y envíos a todo el Perú. Para multifuncionales y equipos de oficina ofrecemos instalación, configuración y puesta en marcha con nuestro equipo técnico.',
    icon: Truck,
  },
  {
    id: 'factura',
    question: '¿Puedo comprar con factura?',
    answer:
      'Sí. Emitimos factura y boleta electrónica. Si compras para tu empresa, podemos cotizar con RUC, crédito según evaluación y condiciones corporativas adaptadas a tu volumen.',
    icon: FileText,
  },
  {
    id: 'soporte',
    question: '¿Tienen soporte técnico?',
    answer:
      'Sí. Contamos con servicio técnico especializado: mantenimiento preventivo y correctivo, repuestos originales y compatibles, y atención presencial o remota para mantener tu flota operativa.',
    icon: Headphones,
  },
  {
    id: 'seminuevos',
    question: '¿Los equipos seminuevos están revisados?',
    answer:
      'Sí. Cada equipo seminuevo o remanufacturado pasa por inspección técnica, prueba de impresión y control de calidad antes de la entrega, con reporte de estado y recomendaciones de uso.',
    icon: Search,
  },
  {
    id: 'cotizacion-empresa',
    question: '¿Puedo cotizar para mi empresa?',
    answer:
      'Sí. Preparamos cotizaciones personalizadas para empresas, flotas de impresión, licitaciones y compras por volumen. Escríbenos por WhatsApp al 915 149 290 o desde la página de contacto.',
    icon: ClipboardList,
  },
] as const;
