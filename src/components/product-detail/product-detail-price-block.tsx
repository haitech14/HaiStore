import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { DualPrice } from '@/components/product/product-dual-price';
import { penToUsd } from '@/lib/utils';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailPriceBlockProps {
  product: Product;
  detail: ProductDetailViewModel;
}

export function ProductDetailPriceBlock({ product, detail }: ProductDetailPriceBlockProps) {
  const oldPriceUsd = detail.oldPricePen != null ? penToUsd(detail.oldPricePen) : null;

  return (
    <div className="mb-4 space-y-1 border-b border-neutral-200 pb-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {oldPriceUsd != null ? (
          <DualPrice
            usd={oldPriceUsd}
            strikethrough
            className="text-sm text-neutral-400"
          />
        ) : null}
        <AdminRolePricesTooltip productId={product.id} displayUsd={product.price}>
          <DualPrice
            usd={product.price}
            className="text-2xl font-bold leading-none text-neutral-900"
          />
        </AdminRolePricesTooltip>
        {detail.discountPercent != null ? (
          <span className="text-sm font-bold text-red-600">-{detail.discountPercent}%</span>
        ) : null}
      </div>
    </div>
  );
}
