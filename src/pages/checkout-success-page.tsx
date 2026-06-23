import { Navigate, useParams } from 'react-router-dom';

import { useCheckoutOrderStatus } from '@/hooks/use-checkout-session';
import { useSeo } from '@/hooks/use-seo';

export function CheckoutSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const decoded = orderNumber ? decodeURIComponent(orderNumber) : '';

  useCheckoutOrderStatus(decoded);

  useSeo({
    title: 'Pedido confirmado | Haitech',
    robots: 'noindex,nofollow',
  });

  if (!decoded) {
    return null;
  }

  return (
    <Navigate
      to={`/mi-cuenta?tab=pedidos&orden=${encodeURIComponent(decoded)}`}
      replace
    />
  );
}
