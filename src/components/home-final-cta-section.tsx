import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { Button } from '@/components/ui/button';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

const ADVISOR_WHATSAPP_MESSAGE =
  'Hola, vengo desde HaiStore. Necesito asesoría para elegir el equipo de impresión adecuado para mi negocio.';

const advisorWhatsAppUrl = buildHaitechWhatsAppUrl(ADVISOR_WHATSAPP_MESSAGE);

export function HomeFinalCtaSection() {
  return (
    <section
      aria-labelledby="cta-asesor-titulo"
      className="border-t border-red-700/30 bg-red-600 py-8 text-white sm:py-10"
    >
      <div className="container flex flex-col items-center gap-4 text-center sm:gap-5">
        <h2
          id="cta-asesor-titulo"
          className="max-w-2xl text-balance text-xl font-bold tracking-tight sm:text-2xl"
        >
          ¿No sabes qué equipo elegir? Te asesoramos gratis.
        </h2>

        <Button
          asChild
          className="min-h-11 gap-2 bg-white px-6 font-semibold text-red-600 hover:bg-white/90 focus-visible:ring-white"
        >
          <a href={advisorWhatsAppUrl} target="_blank" rel="noopener noreferrer">
            <Icon path={mdiWhatsapp} size={0.9} aria-hidden="true" />
            Hablar con un asesor
          </a>
        </Button>
      </div>
    </section>
  );
}
