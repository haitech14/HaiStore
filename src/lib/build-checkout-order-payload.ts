import { cartLineUnitUsd } from '@/context/cart-context';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import type { CreateStoreOrderPayload, HaitechClient } from '@/types/haitech-domain';
import type { CartItem } from '@/types/product';

export function buildCheckoutOrderPayload(
  items: CartItem[],
  customer: HaitechClient,
  paymentMethod: string,
  currency: 'USD' | 'PEN',
): CreateStoreOrderPayload {
  return {
    customer,
    lineItems: items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPriceUsd: cartLineUnitUsd(item),
      imageUrl: item.product.image_url ?? null,
    })),
    currency,
    paymentMethod,
    paymentStatus: 'pending',
    status: 'pending_payment',
    exchangeRate: getUsdToPenSaleRate(),
    notes: 'Pedido web — checkout',
  };
}
