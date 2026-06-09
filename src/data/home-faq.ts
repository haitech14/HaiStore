export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const HOME_FAQ_ITEMS: readonly HomeFaqItem[] = [
  {
    id: 'garantia',
    question: '¿Los equipos tienen garantía?',
    answer:
      'Sí. Los equipos nuevos incluyen garantía oficial del fabricante. Los seminuevos y remanufacturados se entregan con revisión técnica HaiTech y garantía documentada según el modelo y la condición del equipo.',
  },
  {
    id: 'delivery',
    question: '¿Hacen delivery e instalación?',
    answer:
      'Sí. Realizamos entregas en Lima Metropolitana y envíos a todo el Perú. Para multifuncionales y equipos de oficina ofrecemos instalación, configuración y puesta en marcha con nuestro equipo técnico.',
  },
  {
    id: 'factura',
    question: '¿Puedo comprar con factura?',
    answer:
      'Sí. Emitimos factura y boleta electrónica. Si compras para tu empresa, podemos cotizar con RUC, crédito según evaluación y condiciones corporativas adaptadas a tu volumen.',
  },
  {
    id: 'soporte',
    question: '¿Tienen soporte técnico?',
    answer:
      'Sí. Contamos con servicio técnico especializado: mantenimiento preventivo y correctivo, repuestos originales y compatibles, y atención presencial o remota para mantener tu flota operativa.',
  },
  {
    id: 'seminuevos',
    question: '¿Los equipos seminuevos están revisados?',
    answer:
      'Sí. Cada equipo seminuevo o remanufacturado pasa por inspección técnica, prueba de impresión y control de calidad antes de la entrega, con reporte de estado y recomendaciones de uso.',
  },
  {
    id: 'cotizacion-empresa',
    question: '¿Puedo cotizar para mi empresa?',
    answer:
      'Sí. Preparamos cotizaciones personalizadas para empresas, flotas de impresión, licitaciones y compras por volumen. Escríbenos por WhatsApp al 915 149 290 o desde la página de contacto.',
  },
] as const;
