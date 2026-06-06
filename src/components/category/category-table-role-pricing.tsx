import { cn, formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';

interface CategoryTableRolePricingProps {
  priceUsd: number;
  className?: string;
}

/** Precio compacto por rol: solo USD y PEN actuales (sin precio comparación tachado). */
export function CategoryTableRolePricing({ priceUsd, className }: CategoryTableRolePricingProps) {
  const usd = Math.max(0, priceUsd);

  return (
    <div className={cn('space-y-0.5 text-right tabular-nums leading-tight', className)}>
      <p className="text-xs font-bold text-foreground">{formatUsd(usd)}</p>
      <p className="text-[0.65rem] font-medium text-muted-foreground">
        {formatPenFromUsdPrecise(usd)}
      </p>
    </div>
  );
}
