import { Coins } from 'lucide-react';

import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { cn } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { DisplayCurrency } from '@/types/display-currency';

function formatExchangeRate(value: number): string {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function useSystemExchangeRates() {
  const { data: settings } = useCompanySettings();
  const saleRate =
    settings?.usdToPenExchangeRate ?? DEFAULT_COMPANY_SETTINGS.usdToPenExchangeRate;
  const purchaseRate =
    settings?.usdToPenPurchaseExchangeRate ??
    settings?.usdToPenExchangeRate ??
    DEFAULT_COMPANY_SETTINGS.usdToPenPurchaseExchangeRate;

  return { saleRate, purchaseRate };
}

const currencyOptions: { id: DisplayCurrency; label: string; shortLabel: string }[] = [
  { id: 'USD', label: 'Dólares', shortLabel: 'USD' },
  { id: 'PEN', label: 'Soles', shortLabel: 'PEN' },
];

export function ExchangeRateDisplay({ className }: { className?: string }) {
  const { saleRate, purchaseRate } = useSystemExchangeRates();

  return (
    <p
      className={cn(
        'shrink-0 whitespace-nowrap text-right text-[0.65rem] tabular-nums leading-tight text-muted-foreground sm:text-xs',
        className,
      )}
      aria-label="Tipo de cambio del sistema"
    >
      <span className="font-medium">Compra:</span>{' '}
      <span className="font-semibold text-foreground">S/ {formatExchangeRate(purchaseRate)}</span>
      <span className="mx-1.5 text-muted-foreground/60" aria-hidden="true">
        ·
      </span>
      <span className="font-medium">Venta:</span>{' '}
      <span className="font-semibold text-foreground">S/ {formatExchangeRate(saleRate)}</span>
    </p>
  );
}

export function HeaderCurrencyControl({ className }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5 sm:gap-3 sm:px-2.5',
        className,
      )}
    >
      <Coins className="hidden size-4 shrink-0 text-red-600 sm:block" aria-hidden="true" />

      <div
        role="group"
        aria-label="Moneda de visualización"
        className="inline-flex shrink-0 rounded-md border border-border/80 bg-background p-0.5"
      >
        {currencyOptions.map((option) => {
          const isActive = displayCurrency === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setDisplayCurrency(option.id)}
              className={cn(
                'min-h-8 rounded px-2 text-[0.65rem] font-semibold transition-colors sm:min-h-9 sm:px-2.5 sm:text-xs',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span className="sm:hidden">{option.shortLabel}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** TC Compra/Venta en barra superior negra (arriba a la derecha). */
export function HeaderExchangeRateStrip({ className }: { className?: string }) {
  const { saleRate, purchaseRate } = useSystemExchangeRates();

  return (
    <p
      className={cn(
        'ml-auto shrink-0 whitespace-nowrap text-right text-[0.65rem] tabular-nums leading-tight text-neutral-400 sm:text-xs',
        className,
      )}
      aria-label="Tipo de cambio del sistema"
    >
      <span className="font-medium">Compra:</span>{' '}
      <span className="font-semibold text-neutral-300">S/ {formatExchangeRate(purchaseRate)}</span>
      <span className="mx-1.5 text-neutral-500" aria-hidden="true">
        ·
      </span>
      <span className="font-medium">Venta:</span>{' '}
      <span className="font-semibold text-neutral-300">S/ {formatExchangeRate(saleRate)}</span>
    </p>
  );
}
