import {
  formatInventoryCategoryStockSummary,
  toCategoryStockPercents,
  type InventoryCategoryStockSnapshot,
} from '@/lib/inventory-stock-status';
import { cn } from '@/lib/utils';

interface InventoryCategoryStockBarProps {
  category: string;
  stats: InventoryCategoryStockSnapshot;
  className?: string;
}

export function InventoryCategoryStockBar({
  category,
  stats,
  className,
}: InventoryCategoryStockBarProps) {
  const { outPercent, lowPercent, healthyPercent } = toCategoryStockPercents(stats);
  const summary = formatInventoryCategoryStockSummary(stats);

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${category}: ${summary}`}
      >
        {healthyPercent > 0 ? (
          <div
            className="h-full bg-green-500 transition-[width]"
            style={{ width: `${healthyPercent}%` }}
            title={`${stats.healthy} en stock (${healthyPercent}%)`}
          />
        ) : null}
        {lowPercent > 0 ? (
          <div
            className="h-full bg-amber-500 transition-[width]"
            style={{ width: `${lowPercent}%` }}
            title={`${stats.low} bajo stock (${lowPercent}%)`}
          />
        ) : null}
        {outPercent > 0 ? (
          <div
            className="h-full bg-destructive transition-[width]"
            style={{ width: `${outPercent}%` }}
            title={`${stats.out} sin stock (${outPercent}%)`}
          />
        ) : null}
      </div>
    </div>
  );
}
