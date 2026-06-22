import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { formatPenInteger, usdToPenCharm, usdToPenPrecise } from '@/lib/pen-pricing';
import { formatUsd } from '@/lib/utils';

interface InventoryDualPriceProps {
  usd: number;
  /** Si no se indica, usa el tipo de cambio de venta. */
  exchangeRate?: number;
  /** Precio de compra: conversión exacta sin redondeo comercial. */
  useCharm?: boolean;
}

export function InventoryDualPrice({
  usd,
  exchangeRate,
  useCharm = true,
}: InventoryDualPriceProps) {
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  const pen = useCharm ? usdToPenCharm(usd, rate) : usdToPenPrecise(usd, rate);

  return (
    <div className="inline-block text-right leading-tight tabular-nums">
      <p className="whitespace-nowrap font-semibold text-foreground">
        {pen > 0 ? formatPenInteger(pen) : 'S/ —'}
      </p>
      <p className="whitespace-nowrap text-[0.65rem] text-muted-foreground">{formatUsd(usd)}</p>
    </div>
  );
}
