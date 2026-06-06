import { ArrowRight, Shield } from 'lucide-react';

import {
  HAIPROTECT_OFFERINGS,
  formatHaiProtectPrice,
  getHaiProtectOfferingPrice,
  type HaiProtectOffering,
  type HaiProtectOfferingId,
} from '@/data/haiprotect-plans';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<
  HaiProtectOffering['variant'],
  { header: string; footer: string; accent: string }
> = {
  'mono-short': {
    header: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800',
    footer: 'bg-neutral-950',
    accent: 'bg-red-600/15',
  },
  'mono-long': {
    header: 'bg-gradient-to-br from-neutral-950 via-[#1a1208] to-neutral-900',
    footer: 'bg-neutral-950',
    accent: 'bg-amber-500/15',
  },
  'color-short': {
    header: 'bg-gradient-to-br from-[#0a1628] via-[#0f2038] to-[#152238]',
    footer: 'bg-[#0a1628]',
    accent: 'bg-blue-500/15',
  },
  'color-long': {
    header: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    footer: 'bg-[#0f172a]',
    accent: 'bg-emerald-500/15',
  },
};

interface HaiProtectPlanCardsProps {
  value: HaiProtectOfferingId;
  onChange: (value: HaiProtectOfferingId) => void;
  idPrefix?: string;
}

export function HaiProtectPlanCards({
  value,
  onChange,
  idPrefix = 'haiprotect-plan',
}: HaiProtectPlanCardsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      role="tablist"
      aria-label="Planes de garantía extendida"
    >
      {HAIPROTECT_OFFERINGS.map((offering) => {
        const isActive = value === offering.id;
        const styles = VARIANT_STYLES[offering.variant];
        const price = getHaiProtectOfferingPrice(offering);

        return (
          <article key={offering.id} className="min-w-0">
            <button
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${offering.id}`}
              aria-selected={isActive}
              onClick={() => onChange(offering.id)}
              className={cn(
                'group flex min-h-[20rem] w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-[0_12px_32px_-18px_hsl(var(--foreground)/0.55)] transition-all sm:min-h-[22rem] lg:min-h-[26rem] lg:aspect-[3/4] lg:max-h-[28rem]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                isActive
                  ? 'border-red-600 ring-2 ring-red-600/40'
                  : 'border-border/70 hover:-translate-y-0.5 hover:border-red-600/35',
              )}
            >
              <div className={cn('relative px-4 pb-4 pt-4 sm:px-5 sm:pt-5', styles.header)}>
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute -right-6 top-0 size-24 rounded-full blur-3xl',
                    styles.accent,
                  )}
                />
                <div className="relative flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-balance text-lg font-bold tracking-tight text-white sm:text-xl">
                      {offering.title}
                    </p>
                    {offering.highlighted ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="text-pretty text-sm leading-snug text-white/85">
                    {offering.description}
                  </p>
                  <p className="text-xl font-bold tracking-tight text-red-400 sm:text-2xl">
                    {formatHaiProtectPrice(price)}
                  </p>
                  <span className="sr-only">{offering.imageAlt}</span>
                </div>
              </div>

              <div className="relative flex min-h-[9.5rem] flex-1 items-end justify-center bg-gradient-to-b from-white to-neutral-100 px-3 pb-2 pt-3 sm:min-h-[10.5rem] sm:px-4">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-950/20 to-transparent"
                />
                <img
                  src={offering.image}
                  alt=""
                  className="relative z-10 max-h-full w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

              <div className={cn('flex items-center px-4 py-3 sm:px-5', styles.footer)}>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
                    isActive ? 'text-red-300' : 'text-red-400 group-hover:text-red-300',
                  )}
                >
                  {isActive ? 'Seleccionado' : 'Elegir plan'}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}

export function HaiProtectHeroBanner() {
  return (
    <div
      className={cn(
        'relative flex min-h-[11.5rem] overflow-hidden rounded-xl border border-border/70 shadow-[0_8px_24px_-16px_hsl(var(--foreground)/0.45)]',
        'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
      )}
    >
      <img
        src="/services/servicio-tecnico/garantia.png"
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[52%] object-contain object-right opacity-35 sm:w-[48%] sm:opacity-40"
        loading="eager"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/95 to-emerald-950/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-0 size-40 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-3 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-2 lg:max-w-[20rem] xl:max-w-[24rem]">
          <div className="flex items-center gap-2">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-500"
              aria-hidden="true"
            >
              <Shield className="size-4" />
            </span>
            <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
              <span className="text-red-500">Hai</span>
              Protect
            </p>
          </div>
          <p className="text-pretty text-sm leading-snug text-white/85 sm:text-[0.9375rem]">
            Protección integral y garantía extendida para equipos de impresión. Elige tu plan y
            contrata la cobertura que necesitas.
          </p>
        </div>
      </div>
    </div>
  );
}
