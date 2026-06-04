import {
  getProductCardTitleContent,
  PRODUCT_CARD_BRAND_ACCENT_CLASS,
  PRODUCT_CARD_BRAND_CLASS,
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
  const { brand, title } = getProductCardTitleContent(product);
  const isTable = variant === 'table';
  const isFeatured = variant === 'featured';
  const brandClass = cn(
    isTable
      ? 'truncate text-[0.6rem] font-normal uppercase tracking-wide text-muted-foreground sm:text-[0.65rem]'
      : isFeatured
        ? 'truncate text-[0.62rem] font-semibold uppercase tracking-wide text-red-600 sm:text-[0.65rem]'
        : brandTone === 'accent'
          ? PRODUCT_CARD_BRAND_ACCENT_CLASS
          : PRODUCT_CARD_BRAND_CLASS,
  );
  const titleClass = isTable
    ? 'line-clamp-3 text-[0.8rem] font-semibold leading-snug text-foreground sm:text-[0.875rem]'
    : isFeatured
      ? cn(PRODUCT_CARD_TITLE_FEATURED_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS)
      : cn(PRODUCT_CARD_TITLE_MAIN_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS);

  return (
    <div className={cn(isTable ? 'space-y-0' : 'space-y-0.5 sm:space-y-1', className)}>
      {brand ? <p className={brandClass}>{brand}</p> : null}
      <h3 className={titleClass}>{title}</h3>
    </div>
  );
}
