import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Building2, Gauge, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

const ADVISOR_OPTIONS = [
  {
    id: 'oficina-pequena',
    label: 'Para oficina pequeña',
    icon: Building2,
    message:
      'Hola, vengo desde HaiStore. Necesito asesoría para elegir una impresora para oficina pequeña.',
  },
  {
    id: 'alto-volumen',
    label: 'Para alto volumen',
    icon: Gauge,
    message:
      'Hola, vengo desde HaiStore. Necesito asesoría para un equipo de alto volumen de impresión.',
  },
  {
    id: 'alquiler',
    label: 'Para alquiler mensual',
    icon: Printer,
    message:
      'Hola, vengo desde HaiStore. Me interesa el alquiler mensual de equipos. ¿Me pueden asesorar?',
  },
] as const;

const defaultAdvisorUrl = buildHaitechWhatsAppUrl(
  'Hola, vengo desde HaiStore. No sé qué impresora necesita mi empresa. ¿Me pueden asesorar gratis?',
);

export function HomeEquipmentAdvisorSection() {
  return (
    <section
      aria-labelledby="equipo-asesor-titulo"
      className="border-t border-border/60 bg-muted/20 py-10 sm:py-12"
    >
      <div className="container flex flex-col items-center gap-6 text-center sm:gap-8">
        <div className="max-w-2xl space-y-2">
          <h2
            id="equipo-asesor-titulo"
            className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            ¿No sabes qué impresora necesita tu empresa?
          </h2>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Cuéntanos tu caso y te orientamos sin compromiso.
          </p>
        </div>

        <ul className="grid w-full max-w-3xl gap-3 sm:grid-cols-3 sm:gap-4">
          {ADVISOR_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            return (
              <li key={option.id}>
                <a
                  href={buildHaitechWhatsAppUrl(option.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-red-600/40 hover:bg-red-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:flex-col sm:items-center sm:px-4 sm:py-5 sm:text-center"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-600/10 text-red-600"
                    aria-hidden="true"
                  >
                    <OptionIcon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{option.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <Button
          asChild
          className="min-h-11 gap-2 bg-[#25D366] px-6 font-semibold text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
        >
          <a href={defaultAdvisorUrl} target="_blank" rel="noopener noreferrer">
            <Icon path={mdiWhatsapp} size={0.9} aria-hidden="true" />
            Recibir asesoría gratis
          </a>
        </Button>
      </div>
    </section>
  );
}
