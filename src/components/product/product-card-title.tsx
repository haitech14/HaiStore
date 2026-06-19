import {
  getProductCardTitleContent,
  PRODUCT_CARD_BRAND_ACCENT_CLASS,
  PRODUCT_CARD_BRAND_CLASS,
  PRODUCT_CARD_CODE_CLASS,
  PRODUCT_CARD_TITLE_CLAMP_CLASS,
  PRODUCT_CARD_TITLE_FEATURED_CLASS,
  PRODUCT_CARD_TITLE_MAIN_CLASS,
} from '@/lib/product-card-title';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductCardTitleProps {
  product: ProductBadgeSource & { name: string; category?: string | null };
  className?: string;
  /** Marca en rojo para vitrina de destacados. */
  brandTone?: 'default' | 'accent';
  /** Vista tabla de catálogo: tipografía compacta tipo hoja de cálculo. */
  variant?: 'card' | 'table' | 'featured';
}

export function ProductCardTitle({
  product,
  className,
  brandTone = 'default',
  variant = 'card',
}: ProductCardTitleProps) {
  const { brand, code, title } = getProductCardTitleContent(product);
  const isTable = variant === 'table';
  const isFeatured = variant === 'featured';
  const brandClass = cn(
    isTable
      ? 'truncate text-[0.65rem] font-normal uppercase tracking-wide text-muted-foreground sm:text-[0.7rem]'
      : isFeatured
        ? 'truncate text-[0.68rem] font-semibold uppercase tracking-wide text-red-600 sm:text-[0.72rem]'
        : brandTone === 'accent'
          ? PRODUCT_CARD_BRAND_ACCENT_CLASS
          : PRODUCT_CARD_BRAND_CLASS,
  );
  const titleClass = isTable
    ? 'line-clamp-2 text-[0.84rem] font-semibold leading-[1.25] text-foreground sm:text-[0.875rem]'
    : isFeatured
      ? cn(PRODUCT_CARD_TITLE_FEATURED_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS)
      : cn(PRODUCT_CARD_TITLE_MAIN_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS);

  const showBrandLine = Boolean(brand);

  return (
    <div className={cn(isTable ? 'space-y-0' : 'space-y-0.5 sm:space-y-1', className)}>
      {showBrandLine ? (
        <p className="flex min-w-0 items-baseline">
          <span className={cn(brandClass, 'min-w-0')}>{brand}</span>
        </p>
      ) : null}
      <h3 className={titleClass}>{title}</h3>
      {code ? (
        <p className={cn(PRODUCT_CARD_CODE_CLASS, isTable ? 'mt-0.5' : 'mt-0.5')}>{code}</p>
      ) : null}
    </div>
  );
}
