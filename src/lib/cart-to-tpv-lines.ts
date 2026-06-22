import { cartLineUnitUsd } from '@/context/cart-context';
import { usdToPen } from '@/lib/utils';
import type { CartItem } from '@/types/product';
import type { TpvLineItem } from '@/types/tpv';

export function cartItemsToTpvLines(items: CartItem[]): TpvLineItem[] {
  return items.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    sku: item.product.code?.trim() || item.product.id,
    brand: item.product.brand ?? 'Haitech',
    quantity: item.quantity,
    unitPricePen: usdToPen(cartLineUnitUsd(item)),
    imageUrl: item.product.image_url,
  }));
}

export function cartItemsSubtotalPen(items: CartItem[]): number {
  return cartItemsToTpvLines(items).reduce(
    (sum, line) => sum + line.unitPricePen * line.quantity,
    0,
  );
}
