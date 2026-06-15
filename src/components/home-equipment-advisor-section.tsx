import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Building2, Gauge, Printer, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const ADVISOR_OPTIONS = [
  {
    id: 'oficina-pequena',
    label: 'Para oficina pequeña',
    description: 'Impresoras compactas y eficientes para equipos reducidos.',
    icon: Building2,
    message:
      'Hola, vengo desde HaiStore. Necesito asesoría para elegir una impresora para oficina pequeña.',
  },
  {
    id: 'alto-volumen',
    label: 'Para alto volumen',
    description: 'Equipos diseñados para grandes cargas de trabajo.',
    icon: Gauge,
    message:
      'Hola, vengo desde HaiStore. Necesito asesoría para un equipo de alto volumen de impresión.',
  },
  {
    id: 'alquiler',
    label: 'Para alquiler mensual',
    description: 'Soluciones flexibles con todo incluido.',
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
      className="relative overflow-hidden bg-neutral-950 py-10 text-white sm:py-12 lg:py-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(220,38,38,0.18),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(220,38,38,0.14),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-red-600/8 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-1/4 bottom-0 h-full w-1/2 skew-x-12 bg-gradient-to-l from-red-600/8 to-transparent"
      />

      <div className="container relative flex flex-col items-center gap-8 text-center sm:gap-10">
        <div className="max-w-2xl space-y-2 sm:space-y-3">
          <h2
            id="equipo-asesor-titulo"
            className="text-balance text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]"
          >
            ¿No sabes qué impresora necesita tu empresa?
          </h2>
          <p className="text-pretty text-sm text-neutral-400 sm:text-base">
            Cuéntanos tu caso y te orientamos sin compromiso.
          </p>
        </div>

        <ul className="grid w-full max-w-4xl gap-4 sm:grid-cols-3 sm:gap-4">
          {ADVISOR_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            return (
              <li key={option.id} className="h-full">
                <a
                  href={buildHaitechWhatsAppUrl(option.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex h-full flex-col items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-5 text-center',
                    'transition-colors hover:border-red-600/40 hover:bg-neutral-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
                  )}
                >
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-red-600/30 bg-red-600/10 text-red-500"
                    aria-hidden="true"
                  >
                    <OptionIcon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="text-sm font-bold text-white sm:text-base">{option.label}</span>
                  <span className="text-pretty text-xs leading-relaxed text-neutral-400 sm:text-sm">
                    {option.description}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="min-h-12 gap-2.5 rounded-full bg-[#25D366] px-8 text-base font-bold text-white shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
          >
            <a href={defaultAdvisorUrl} target="_blank" rel="noopener noreferrer">
              <Icon path={mdiWhatsapp} size={1} aria-hidden="true" />
              Recibir asesoría gratis
            </a>
          </Button>

          <p className="inline-flex items-center gap-1.5 text-xs text-neutral-400 sm:text-sm">
            <ShieldCheck className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
            Asesoría 100% gratuita y personalizada
          </p>
        </div>
      </div>
    </section>
  );
}
