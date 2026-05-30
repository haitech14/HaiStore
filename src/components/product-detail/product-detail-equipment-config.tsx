import { useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, ChevronUp, Layers } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import type { EquipmentConfigStep } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductDetailEquipmentConfigProps {
  steps: EquipmentConfigStep[];
}

const STEP_SUMMARY = 'Equipo base · Casetera · Acabado · Imp./Esc. · Seguridad · Ton...';

export function ProductDetailEquipmentConfig({ steps }: ProductDetailEquipmentConfigProps) {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((step) => [step.id, step.defaultSelected])),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (steps.length === 0) return null;

  return (
    <section
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
      aria-labelledby="config-equipo-titulo"
    >
      <button
        type="button"
        id="config-equipo-titulo"
        className="flex w-full items-start gap-3 border-b border-neutral-200 px-4 py-4 text-left sm:px-5"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
          <Layers className="size-4" aria-hidden="true" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-neutral-900">Configuración del equipo</span>
            <span className="text-sm text-neutral-400">{steps.length} pasos</span>
          </span>
          <span className="mt-1 block truncate text-sm text-neutral-400">{STEP_SUMMARY}</span>
        </span>

        <ChevronUp
          className={cn(
            'size-5 shrink-0 text-neutral-400 transition-transform',
            !expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="relative px-4 py-4 sm:px-5">
          <div className="overflow-hidden pr-10" ref={emblaRef}>
            <ul className="flex gap-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.id} className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_200px]">
                    <article className="relative flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-3">
                      <Checkbox
                        id={`config-${step.id}`}
                        checked={selected[step.id]}
                        onCheckedChange={(checked) =>
                          setSelected((prev) => ({ ...prev, [step.id]: checked === true }))
                        }
                        className="absolute left-3 top-3 z-10 border-neutral-400 data-[state=checked]:border-neutral-800 data-[state=checked]:bg-neutral-800"
                        aria-label={`Incluir ${step.title} en la configuración`}
                      />

                      <div className="mx-auto mt-5 flex size-16 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
                        <Icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-neutral-900">
                        {step.stepNumber}. {step.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-neutral-500">{step.subtitle}</p>
                      <p className="mt-3 text-sm font-bold text-neutral-900">
                        S/ {step.pricePen.toFixed(2)}
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>

          {steps.length > 1 && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Ver más pasos de configuración"
              className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:right-5"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
