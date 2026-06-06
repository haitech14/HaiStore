import {
  getInventoryStockBarPercent,
  getInventoryStockStatus,
  INVENTORY_STOCK_STATUS_LABELS,
  type InventoryStockStatusLevel,
} from '@/lib/inventory-stock-status';
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

interface InventoryStockStatusBarProps {
  stock: number;
  className?: string;
  /** Oculta la cantidad numérica (solo barra + etiqueta). */
  hideQuantity?: boolean;
  compact?: boolean;
}

export function InventoryStockStatusBar({
  stock,
  className,
  hideQuantity = false,
  compact = false,
}: InventoryStockStatusBarProps) {
  const status = getInventoryStockStatus(stock);
  const percent = getInventoryStockBarPercent(stock);
  const label = INVENTORY_STOCK_STATUS_LABELS[status];
  const qty = Math.max(0, Math.floor(Number(stock) || 0));

  return (
    <div className={cn('flex min-w-[4.5rem] flex-col items-center gap-1', className)}>
      {!hideQuantity ? (
        <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">
          {status === 'out' ? '—' : `${qty} uds.`}
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
          className={cn('h-full rounded-full transition-[width]', BAR_FILL_CLASS[status])}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-1 font-medium',
          compact ? 'text-[0.6rem]' : 'text-[0.65rem]',
          LABEL_CLASS[status],
        )}
      >
        <span
          className={cn('size-1.5 shrink-0 rounded-full', BAR_FILL_CLASS[status])}
          aria-hidden="true"
        />
        {label}
      </span>
    </div>
  );
}
