import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Droplet, Headphones, Wrench, type LucideIcon } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { Label } from '@/components/ui/label';
import { cn, penToUsd } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';

interface ProductDetailRentalOptionProps {
  plans: RentalPlanOption[];
  className?: string;
}

const DEFAULT_PAGES = 5000;

const RENTAL_BENEFITS: { icon: LucideIcon; label: string; sublabel: string }[] = [
  { icon: Wrench, label: 'Mantenimiento', sublabel: 'Incluido' },
  { icon: Droplet, label: 'Tóner', sublabel: 'Incluido' },
  { icon: Headphones, label: 'Soporte', sublabel: 'Técnico' },
];

export function ProductDetailRentalOption({ plans, className }: ProductDetailRentalOptionProps) {
  const defaultPlan =
    plans.find((plan) => plan.pagesPerMonth === DEFAULT_PAGES) ?? plans[0];

  const [selectedPages, setSelectedPages] = useState(
    defaultPlan?.pagesPerMonth ?? plans[0]?.pagesPerMonth ?? DEFAULT_PAGES,
  );
  const [benefitsOpen, setBenefitsOpen] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.pagesPerMonth === selectedPages) ?? plans[0],
    [plans, selectedPages],
  );

  if (!selectedPlan || plans.length === 0) return null;

  return (
    <section
      className={cn('rounded-xl border border-neutral-200 bg-white p-4', className)}
      aria-label="Alquiler mensual"
    >
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3 sm:flex-nowrap sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-neutral-700">Alquila desde</p>
          <p className="text-2xl font-bold leading-none text-neutral-900">
            <DualPrice usd={penToUsd(selectedPlan.monthlyPricePen)} className="inline font-bold" />
            <span className="text-sm font-normal text-neutral-500"> / mes</span>
          </p>
        </div>

        <div className="relative w-full min-w-[9rem] sm:w-auto sm:min-w-[8.5rem] sm:pt-1">
          <Label htmlFor="rental-pages-detail" className="sr-only">
            Producción estimada por mes
          </Label>
          <select
            id="rental-pages-detail"
            value={selectedPages}
            onChange={(event) => setSelectedPages(Number(event.target.value))}
            aria-label="Producción estimada por mes"
            className="h-9 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-8 text-sm font-medium text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:w-36"
          >
            {plans.map((plan) => (
              <option key={plan.pagesPerMonth} value={plan.pagesPerMonth}>
                {plan.pagesPerMonth.toLocaleString('es-PE')} pág./mes
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setBenefitsOpen((open) => !open)}
        aria-expanded={benefitsOpen}
        aria-controls="rental-benefits-panel"
        className="mt-2.5 flex w-full items-center justify-between gap-2 rounded-md py-1 text-left text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <span>Qué incluye el alquiler</span>
        {benefitsOpen ? (
          <ChevronUp className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        )}
      </button>

      <div
        id="rental-benefits-panel"
        hidden={!benefitsOpen}
        className={cn(benefitsOpen && 'mt-2 border-t border-neutral-100 pt-3')}
      >
        {benefitsOpen && (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {RENTAL_BENEFITS.map(({ icon: Icon, label, sublabel }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-lg bg-neutral-50 px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight text-neutral-800">{label}</p>
                  <p className="text-[0.68rem] leading-tight text-neutral-500">{sublabel}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
