import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import {
  SEMINUEVA_PREPARATION_LABELS,
  type SeminuevaPreparationType,
} from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailPreparationTypeSelectorProps {
  product: Product;
  value: SeminuevaPreparationType;
  onChange: (value: SeminuevaPreparationType) => void;
  className?: string;
}

export function ProductDetailPreparationTypeSelector({
  product,
  value,
  onChange,
  className,
}: ProductDetailPreparationTypeSelectorProps) {
  const isColor = isColorPrinterEquipment(product);
  const surchargeLabel = isColor ? '+USD 350' : '+USD 250';

  return (
    <fieldset className={cn('mt-4 space-y-2.5', className)}>
      <legend className="text-sm font-semibold text-[#0f1f3d]">Tipo de preparado</legend>
      <div className="space-y-2">
        {(['acondicionada', 'semirepotenciada'] as const).map((option) => {
          const id = `preparation-type-${option}`;
          const isActive = value === option;
          return (
            <label
              key={option}
              htmlFor={id}
              className={cn(
                'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                'focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2',
                isActive
                  ? 'border-red-600 bg-red-50/80'
                  : 'border-border bg-background hover:border-red-300 hover:bg-muted/30',
              )}
            >
              <input
                id={id}
                type="radio"
                name="preparation-type"
                value={option}
                checked={isActive}
                onChange={() => onChange(option)}
                className="mt-1 size-4 shrink-0 accent-red-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {SEMINUEVA_PREPARATION_LABELS[option]}
                </span>
                {option === 'semirepotenciada' ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Recargo {surchargeLabel} sobre precio público ({isColor ? 'Color' : 'B/N'})
                  </span>
                ) : (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Precio público estándar
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
