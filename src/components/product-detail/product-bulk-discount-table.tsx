import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ensureFullPrices } from '@/lib/roles';
import { cn, formatUsd } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductBulkDiscountTableProps {
  product: Product;
  tiers: BulkDiscountTier[];
  className?: string;
  defaultOpen?: boolean;
  /** Dentro del panel de precios (sin borde exterior ni cabecera oscura). */
  embedded?: boolean;
}

function tierUnitUsd(basePriceUsd: number, discountPercent: number): number {
  return Math.round(basePriceUsd * (1 - discountPercent / 100) * 100) / 100;
}

export function ProductBulkDiscountTable({
  product,
  tiers,
  className,
  defaultOpen = false,
  embedded = false,
}: ProductBulkDiscountTableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  if (tiers.length === 0) return null;

  const basePriceUsd = product.prices
    ? ensureFullPrices(product.prices).public
    : product.price;

  return (
    <div
      className={cn(
        embedded
          ? 'border-t border-border/60 text-xs sm:text-[0.8125rem]'
          : 'overflow-hidden rounded-lg border border-border/70 text-xs sm:text-[0.8125rem]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-4 py-3 text-left',
          embedded
            ? 'bg-white text-[#0f1f3d] transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1f3d] focus-visible:ring-offset-2'
            : 'bg-[#0f1f3d] px-3 py-2 text-white transition-colors hover:bg-[#0f1f3d]/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1f3d] focus-visible:ring-offset-2',
        )}
      >
        <span className={cn('font-bold', embedded ? 'text-sm' : 'text-xs tracking-wide sm:text-sm')}>
          Precio por volumen
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className={cn(!open && 'hidden')}
      >
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Descuentos por volumen</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Cantidad</th>
              <th scope="col">Descuento</th>
              <th scope="col">Precio por unidad</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => {
              const unitUsd = tierUnitUsd(basePriceUsd, tier.discountPercent);

              return (
                <tr
                  key={tier.range}
                  className={cn(
                    'bg-white text-[#0f1f3d]',
                    index > 0 && 'border-t border-border/60',
                  )}
                >
                  <td className="px-3 py-2 font-semibold">{tier.range}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-semibold text-[#0f1f3d]">
                      {tier.discount}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-bold">
                    <DualPrice usd={unitUsd} className="text-xs font-bold sm:text-[0.8125rem]" />
                    <span className="sr-only">{formatUsd(unitUsd)} por unidad</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
