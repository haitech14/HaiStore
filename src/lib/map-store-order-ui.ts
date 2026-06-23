import type { OrderState } from '@/components/account/order-status-steps';
import type { StoreOrder, StoreOrderStatus } from '@/types/store';

export function mapStoreOrderStatusToUi(status: StoreOrderStatus): OrderState {
  switch (status) {
    case 'pending_payment':
    case 'confirmed':
      return 'confirmado';
    case 'processing':
      return 'preparando';
    case 'shipped':
      return 'enviado';
    case 'delivered':
      return 'entregado';
    case 'cancelled':
      return 'confirmado';
    default:
      return 'confirmado';
  }
}

export function formatOrderDate(isoDate: string): { label: string; iso: string } {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return { label: isoDate, iso: isoDate };
  }
  return {
    label: date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    iso: date.toISOString().slice(0, 10),
  };
}

export function formatOrderTotal(order: StoreOrder): string {
  if (order.currency === 'PEN' && order.total_pen != null) {
    return `S/ ${order.total_pen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }
  return `$ ${order.total_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export function formatShippingAddress(order: StoreOrder): string {
  const addr = (order.shipping_address ?? order.billing_address) as Record<
    string,
    unknown
  > | null;
  if (!addr) return '—';
  const parts = [
    typeof addr.direccion === 'string' ? addr.direccion : null,
    typeof addr.ciudad === 'string' ? addr.ciudad : null,
    typeof addr.atencion === 'string' ? `Att: ${addr.atencion}` : null,
  ].filter(Boolean);
  return parts.join(', ') || '—';
}

export function orderTrackingMessage(order: StoreOrder): string {
  if (order.delivered_at) {
    const date = formatOrderDate(order.delivered_at);
    return `Entregado el ${date.label}`;
  }
  if (order.shipped_at) {
    return 'En camino a tu dirección';
  }
  if (order.payment_status === 'pending') {
    return 'Pendiente de confirmación de pago';
  }
  return 'Pedido en preparación';
}
