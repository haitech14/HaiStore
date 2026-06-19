import { useMemo, useState } from 'react';
import { Calculator, CalendarDays, ChevronDown, FileText } from 'lucide-react';

import { ProductRentalQuoteDialog } from '@/components/product-detail/product-rental-quote-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_EXCESS_COPY_COST_PEN,
  RENTAL_OPERATOR_MONTHLY_PEN,
  RENTAL_PAPER_SURCHARGE_PEN,
  RENTAL_TERM_MONTHS,
  RENTAL_TERM_RENEWAL_NOTE,
  calculateRentalQuote,
  formatPen,
} from '@/lib/rental-calculator';
import { cn, penToUsd } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailRentalBannerProps {
  product: Product;
  plans: RentalPlanOption[];
  displayTitle: string;
  sku: string;
  brandLabel: string;
  className?: string;
}

function BreakdownLine({
  label,
  amountPen,
}: {
  label: string;
  amountPen: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="shrink-0 font-semibold tabular-nums text-foreground">
        <DualPrice usd={penToUsd(amountPen)} />
      </dd>
    </div>
  );
}

export function ProductDetailRentalBanner({
  product,
  plans,
  displayTitle,
  sku,
  brandLabel,
  className,
}: ProductDetailRentalBannerProps) {
  const [open, setOpen] = useState(false);
  const [monthlyPages, setMonthlyPages] = useState(RENTAL_DEFAULT_MONTHLY_PAGES);
  const [includesPaper, setIncludesPaper] = useState(true);
  const [includesOperator, setIncludesOperator] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePdfPreview, setQuotePdfPreview] = useState<QuotePdfPreview | null>(null);

  const fromMonthlyPen = useMemo(() => {
    if (plans.length === 0) return 0;
    const estimate = calculateRentalQuote({
      monthlyPages: RENTAL_DEFAULT_MONTHLY_PAGES,
      includesPaper: true,
      includesOperator: false,
      plans,
    });
    return estimate.monthlySubtotalPen;
  }, [plans]);

  const quote = useMemo(
    () =>
      calculateRentalQuote({
        monthlyPages,
        includesPaper,
        includesOperator,
        plans,
      }),
    [monthlyPages, includesPaper, includesOperator, plans],
  );

  const panelId = 'rental-simulator-panel';

  if (plans.length === 0) return null;

  const handleQuotePdfPreviewClose = (isOpen: boolean) => {
    if (isOpen) return;
    if (quotePdfPreview?.url) {
      URL.revokeObjectURL(quotePdfPreview.url);
    }
    setQuotePdfPreview(null);
  };

  return (
    <>
      <section
        aria-labelledby="rental-banner-title"
        className={cn(
          'overflow-hidden rounded-xl border border-foreground/15 bg-background',
          className,
        )}
      >
        <button
          type="button"
          className="flex w-full items-start gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-background text-foreground"
            aria-hidden="true"
          >
            <CalendarDays className="size-5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span
              id="rental-banner-title"
              className="block text-base font-bold text-foreground sm:text-lg"
            >
              Alquílalo desde{' '}
              <DualPrice usd={penToUsd(fromMonthlyPen)} className="inline font-bold" /> mensual
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
              {open
                ? `Simula producción mensual y servicios incluidos. Plazo fijo de ${RENTAL_TERM_MONTHS} meses con renovación automática del equipo nuevo.`
                : '¿Prefieres alquilarla? Toca para simular tu plan.'}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'mt-1 size-5 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div id={panelId} className="space-y-4 p-4 sm:p-5">
            <div
              className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground"
              role="note"
            >
              <p>
                <span className="font-semibold">Plazo de alquiler:</span> {RENTAL_TERM_MONTHS} meses
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{RENTAL_TERM_RENEWAL_NOTE}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="rental-monthly-pages"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Producción mensual (ejemplo)
                </Label>
                <Input
                  id="rental-monthly-pages"
                  type="number"
                  min={1}
                  step={500}
                  value={monthlyPages}
                  onChange={(event) =>
                    setMonthlyPages(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="h-11 tabular-nums"
                />
                <p className="text-xs text-muted-foreground">
                  Cuota base del plan: {quote.includedPages.toLocaleString('es-PE')} pág./mes.
                  Referencia: {RENTAL_DEFAULT_MONTHLY_PAGES.toLocaleString('es-PE')} páginas/mes.
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Servicios incluidos
                </legend>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="rental-includes-paper"
                    checked={includesPaper}
                    onCheckedChange={(checked) => setIncludesPaper(checked === true)}
                  />
                  <Label htmlFor="rental-includes-paper" className="text-sm font-normal leading-snug">
                    Incluye papel (+ S/ {RENTAL_PAPER_SURCHARGE_PEN.toFixed(2)} por página)
                  </Label>
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="rental-includes-operator"
                    checked={includesOperator}
                    onCheckedChange={(checked) => setIncludesOperator(checked === true)}
                  />
                  <Label
                    htmlFor="rental-includes-operator"
                    className="text-sm font-normal leading-snug"
                  >
                    Incluye operador (+ S/ {formatPen(RENTAL_OPERATOR_MONTHLY_PEN)} cuota fija mensual)
                  </Label>
                </div>
              </fieldset>
            </div>

            <div
              className="rounded-lg border border-border/60 bg-muted/20 p-4"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calculator className="size-4 shrink-0" aria-hidden="true" />
                Estimación mensual
              </div>

              <dl className="space-y-2 text-sm">
                <BreakdownLine label="Cuota fija mensual" amountPen={quote.baseMonthlyPen} />

                {quote.excessChargesPen > 0 ? (
                  <BreakdownLine
                    label={`Excedente copia negro (${quote.extraPages.toLocaleString('es-PE')} × S/ ${RENTAL_EXCESS_COPY_COST_PEN.toFixed(2)})`}
                    amountPen={quote.excessChargesPen}
                  />
                ) : null}

                {includesPaper ? (
                  <BreakdownLine
                    label={`Papel (${quote.monthlyPages.toLocaleString('es-PE')} × S/ ${RENTAL_PAPER_SURCHARGE_PEN.toFixed(2)})`}
                    amountPen={quote.paperChargesPen}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <dt className="text-muted-foreground">Papel</dt>
                    <dd className="text-amber-700">No incluido</dd>
                  </div>
                )}

                {includesOperator ? (
                  <BreakdownLine
                    label="Operador — cuota fija mensual"
                    amountPen={quote.operatorChargesPen}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <dt className="text-muted-foreground">Operador</dt>
                    <dd className="text-amber-700">No incluido</dd>
                  </div>
                )}

                <div className="border-t border-border/60 pt-2">
                  <div className="flex items-center justify-between gap-3 font-bold text-foreground">
                    <dt>Total mensual estimado</dt>
                    <dd className="tabular-nums">
                      <DualPrice usd={penToUsd(quote.monthlySubtotalPen)} className="inline font-bold" />
                    </dd>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-base font-bold text-foreground">
                  <dt>Total contrato ({quote.termMonths} meses)</dt>
                  <dd className="tabular-nums">
                    <DualPrice usd={penToUsd(quote.contractTotalPen)} className="inline font-bold" />
                  </dd>
                </div>
              </dl>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2 border-foreground text-foreground hover:bg-foreground hover:text-background"
              onClick={() => setQuoteOpen(true)}
            >
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              Generar cotización de alquiler
            </Button>
          </div>
        ) : null}
      </section>

      <ProductRentalQuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        product={product}
        displayTitle={displayTitle}
        sku={sku}
        brandLabel={brandLabel}
        breakdown={quote}
        onGenerated={setQuotePdfPreview}
      />

      <ProductQuotePdfViewer preview={quotePdfPreview} onOpenChange={handleQuotePdfPreviewClose} />
    </>
  );
}
