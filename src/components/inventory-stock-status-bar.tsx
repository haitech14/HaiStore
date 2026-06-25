import {
  getInventoryStockBarPercent,
  getInventoryStockStatus,
  INVENTORY_STOCK_STATUS_LABELS,
  type InventoryStockStatusLevel,
} from '@/lib/inventory-stock-status';
import { ON_REQUEST_STOCK_BADGE_CLASS } from '@/components/cart/add-to-cart-button';
import { cn } from '@/lib/utils';

const BAR_FILL_CLASS: Record<InventoryStockStatusLevel, string> = {
  out: 'bg-destructive',
  low: 'bg-amber-500',
  healthy: 'bg-green-500',
};

const LABEL_CLASS: Record<InventoryStockStatusLevel, string> = {
  out: 'text-destructive',
  low: 'text-amber-700',
  healthy: 'text-green-700',
};

const STOREFRONT_BAR_FILL_CLASS: Record<InventoryStockStatusLevel, string> = {
  out: 'bg-amber-400',
  low: 'bg-amber-500',
  healthy: 'bg-green-500',
};

const STOREFRONT_LABEL_CLASS: Record<InventoryStockStatusLevel, string> = {
  out: 'text-amber-950',
  low: 'text-amber-800',
  healthy: 'text-green-700',
};

const STOREFRONT_STATUS_LABELS: Record<InventoryStockStatusLevel, string> = {
  out: 'A pedido',
  low: 'Bajo stock',
  healthy: 'En stock',
};

interface InventoryStockStatusBarProps {
  stock: number;
  className?: string;
  /** Oculta la cantidad numérica (solo barra + etiqueta). */
  hideQuantity?: boolean;
  compact?: boolean;
  /** Catálogo público: «A pedido» en naranja en lugar de «Sin stock». */
  variant?: 'admin' | 'storefront';
}

export function InventoryStockStatusBar({
  stock,
  className,
  hideQuantity = false,
  compact = false,
  variant = 'admin',
}: InventoryStockStatusBarProps) {
  const status = getInventoryStockStatus(stock);
  const percent = getInventoryStockBarPercent(stock);
  const isStorefront = variant === 'storefront';
  const label = isStorefront ? STOREFRONT_STATUS_LABELS[status] : INVENTORY_STOCK_STATUS_LABELS[status];
  const barFill = isStorefront ? STOREFRONT_BAR_FILL_CLASS : BAR_FILL_CLASS;
  const labelClass = isStorefront ? STOREFRONT_LABEL_CLASS : LABEL_CLASS;
  const qty = Math.max(0, Math.floor(Number(stock) || 0));

  return (
    <div className={cn('flex min-w-[4.5rem] flex-col items-center gap-1', className)}>
      {!hideQuantity ? (
        <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">
          {status === 'out' ? '—' : `${qty} unids.`}
        </span>
      ) : null}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-muted',
          compact ? 'h-1' : 'h-1.5',
        )}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}${status === 'out' ? '' : `: ${qty} unidades`}`}
      >
        <div
          className={cn('h-full rounded-full transition-[width]', barFill[status])}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-1 font-medium',
          compact ? 'text-[0.6rem]' : 'text-[0.65rem]',
          labelClass[status],
          isStorefront && status === 'out' && ON_REQUEST_STOCK_BADGE_CLASS,
        )}
      >
        <span
          className={cn('size-1.5 shrink-0 rounded-full', barFill[status])}
          aria-hidden="true"
        />
        {label}
      </span>
    </div>
  );
}
