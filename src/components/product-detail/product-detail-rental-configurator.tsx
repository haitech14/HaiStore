import { useEffect, useMemo, useState } from 'react';

import {
  RENTAL_BW_VARIABLE_COPY_COST_PEN,
  RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN,
  RENTAL_COLOR_VARIABLE_COPY_COST_PEN,
  RENTAL_MIN_BILLABLE_PAGES,
} from '@/lib/rental-calculator';
import { cn, usdToPen } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';

export interface EquipmentRentalEstimate {
  billablePages: number;
  /** @deprecated Usar variableFeeMonthlyPen */
  copyCostMonthlyPen: number;
  fixedFeeMonthlyPen: number;
  variableFeeMonthlyPen: number;
  blackVariableMonthlyPen: number;
  colorVariableMonthlyPen: number;
  isColorEquipment: boolean;
  estimatedMonthlyPen: number;
  termMonths: 6 | 12 | 36;
  equipmentQuantity: number;
  monthlyPages: number;
  hasExtraServices: boolean;
}

interface ProductDetailRentalConfiguratorProps {
  rentalPlans: RentalPlanOption[];
  equipmentBasePriceUsd: number;
  isColorEquipment?: boolean;
  onEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  className?: string;
  hideTitle?: boolean;
}

export function computeEquipmentRentalEstimate(input: {
  monthlyPages: number;
  equipmentQuantity: number;
  termMonths: 6 | 12 | 36;
  equipmentBasePriceUsd: number;
  isColorEquipment?: boolean;
  includePaper: boolean;
  includeOperator: boolean;
  includeLaptop: boolean;
  includeLaminator: boolean;
  includeGuillotine: boolean;
}): EquipmentRentalEstimate {
  const billablePages = Math.max(RENTAL_MIN_BILLABLE_PAGES, input.monthlyPages || 0);
  const quantity = Math.max(1, input.equipmentQuantity);
  const isColorEquipment = input.isColorEquipment === true;

  const blackVariableMonthlyPen = isColorEquipment
    ? billablePages * RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN * quantity
    : billablePages * RENTAL_BW_VARIABLE_COPY_COST_PEN * quantity;
  const colorVariableMonthlyPen = isColorEquipment
    ? billablePages * RENTAL_COLOR_VARIABLE_COPY_COST_PEN * quantity
    : 0;
  const variableFeeMonthlyPen = blackVariableMonthlyPen + colorVariableMonthlyPen;
  const fixedFeeMonthlyPen =
    ((usdToPen(input.equipmentBasePriceUsd) * 0.2) / input.termMonths) * quantity;

  return {
    billablePages,
    copyCostMonthlyPen: variableFeeMonthlyPen,
    fixedFeeMonthlyPen,
    variableFeeMonthlyPen,
    blackVariableMonthlyPen,
    colorVariableMonthlyPen,
    isColorEquipment,
    estimatedMonthlyPen: fixedFeeMonthlyPen + variableFeeMonthlyPen,
    termMonths: input.termMonths,
    equipmentQuantity: quantity,
    monthlyPages: input.monthlyPages,
    hasExtraServices:
      input.includePaper ||
      input.includeOperator ||
      input.includeLaptop ||
      input.includeLaminator ||
      input.includeGuillotine,
  };
}

export function ProductDetailRentalConfigurator({
  rentalPlans,
  equipmentBasePriceUsd,
  isColorEquipment = false,
  onEstimateChange,
  className,
  hideTitle = false,
}: ProductDetailRentalConfiguratorProps) {
  const [includeLaminator, setIncludeLaminator] = useState(false);
  const [includeGuillotine, setIncludeGuillotine] = useState(false);
  const [monthlyPages, setMonthlyPages] = useState(() => rentalPlans[0]?.pagesPerMonth ?? 5000);
  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [termMonths, setTermMonths] = useState<6 | 12 | 36>(12);
  const [includePaper, setIncludePaper] = useState(false);
  const [includeOperator, setIncludeOperator] = useState(false);
  const [includeLaptop, setIncludeLaptop] = useState(false);

  const rentalPageSuggestions = useMemo(
    () =>
      Array.from(new Set([5000, ...rentalPlans.map((plan) => plan.pagesPerMonth)]))
        .filter((pages) => pages > 0)
        .sort((a, b) => a - b),
    [rentalPlans],
  );

  const estimate = useMemo(
    () =>
      computeEquipmentRentalEstimate({
        monthlyPages,
        equipmentQuantity,
        termMonths,
        equipmentBasePriceUsd,
        isColorEquipment,
        includePaper,
        includeOperator,
        includeLaptop,
        includeLaminator,
        includeGuillotine,
      }),
    [
      monthlyPages,
      equipmentQuantity,
      termMonths,
      equipmentBasePriceUsd,
      isColorEquipment,
      includePaper,
      includeOperator,
      includeLaptop,
      includeLaminator,
      includeGuillotine,
    ],
  );

  useEffect(() => {
    onEstimateChange?.(estimate);
  }, [estimate, onEstimateChange]);

  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3 text-left sm:p-4',
        className,
      )}
    >
      {hideTitle ? null : (
        <h3 className="text-sm font-bold text-foreground">Configura tu equipo</h3>
      )}

      <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', hideTitle ? '' : 'mt-0')}>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-foreground">Cantidad de impresiones / mes</span>
          <input
            type="number"
            min={5000}
            step={500}
            value={monthlyPages}
            onChange={(event) => setMonthlyPages(Number(event.target.value) || 5000)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          />
          {rentalPageSuggestions.length > 0 ? (
            <span className="block text-[0.6875rem] text-muted-foreground">
              Sugerencias:{' '}
              {rentalPageSuggestions.map((pages) => pages.toLocaleString('es-PE')).join(' · ')}
            </span>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-foreground">Cantidad de equipos</span>
          <input
            type="number"
            min={1}
            step={1}
            value={equipmentQuantity}
            onChange={(event) => setEquipmentQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          />
        </label>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold text-foreground">Plazo del contrato</legend>
        <div className="grid grid-cols-3 gap-2">
          {[6, 12, 36].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTermMonths(months as 6 | 12 | 36)}
              className={cn(
                'h-9 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                termMonths === months
                  ? 'border-red-600 bg-red-50 text-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted/30',
              )}
              aria-pressed={termMonths === months}
            >
              {months} meses
            </button>
          ))}
        </div>
        {termMonths === 36 ? (
          <p className="text-[0.6875rem] font-medium text-red-600">
            Plan de 36 meses con renovación automática.
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold text-foreground">Servicios adicionales</legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includePaper}
              onChange={(event) => setIncludePaper(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Suministro de papel
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includeOperator}
              onChange={(event) => setIncludeOperator(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Operador dedicado
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includeLaptop}
              onChange={(event) => setIncludeLaptop(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Laptop
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includeLaminator}
              onChange={(event) => setIncludeLaminator(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Enmicadora
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={includeGuillotine}
              onChange={(event) => setIncludeGuillotine(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Guillotina
          </label>
        </div>
      </fieldset>

      <div className="rounded-md border border-border/70 bg-background px-3 py-2 text-xs text-foreground">
        {isColorEquipment ? (
          <p>
            Cuota variable mensual: negro{' '}
            <span className="font-semibold">S/ {RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN}</span>
            {' + '}color{' '}
            <span className="font-semibold">S/ {RENTAL_COLOR_VARIABLE_COPY_COST_PEN}</span>
            {' × '}
            <span className="font-semibold">{estimate.billablePages.toLocaleString('es-PE')}</span>{' '}
            páginas (mínimo {RENTAL_MIN_BILLABLE_PAGES.toLocaleString('es-PE')}).
          </p>
        ) : (
          <p>
            Cuota variable mensual: negro{' '}
            <span className="font-semibold">S/ {RENTAL_BW_VARIABLE_COPY_COST_PEN}</span>
            {' × '}
            <span className="font-semibold">{estimate.billablePages.toLocaleString('es-PE')}</span>{' '}
            páginas (mínimo {RENTAL_MIN_BILLABLE_PAGES.toLocaleString('es-PE')}).
          </p>
        )}
        <p className="mt-1">
          Cuota fija mensual: <span className="font-semibold">precio del equipo x 20%</span> /{' '}
          <span className="font-semibold">{estimate.termMonths} meses</span>.
        </p>
        <p className="mt-1.5 font-semibold text-foreground">
          Estimado mensual: S/{' '}
          {estimate.estimatedMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
        </p>
        <p className="text-[0.6875rem] text-muted-foreground">
          Incluye: cuota variable S/{' '}
          {estimate.variableFeeMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
          {estimate.isColorEquipment ? (
            <>
              {' '}
              (negro S/{' '}
              {estimate.blackVariableMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
              {' + '}color S/{' '}
              {estimate.colorVariableMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
              )
            </>
          ) : null}
          {' + '}cuota fija S/{' '}
          {estimate.fixedFeeMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}.
        </p>
        {estimate.hasExtraServices ? (
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">
            Extras seleccionados:{' '}
            {[
              includePaper ? 'Papel' : null,
              includeOperator ? 'Operador' : null,
              includeLaptop ? 'Laptop' : null,
              includeLaminator ? 'Enmicadora' : null,
              includeGuillotine ? 'Guillotina' : null,
            ]
              .filter(Boolean)
              .join(', ')}{' '}
            (cotización personalizada).
          </p>
        ) : null}
      </div>
    </div>
  );
}
