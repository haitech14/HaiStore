import type { OrderStatus } from '@/components/admin/AdminOrderStatusBadge';
import type { StoreOrderStatus, StorePaymentStatus } from '@/types/store';

export const STORE_ORDER_STATUS_LABELS: Record<StoreOrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  confirmed: 'Confirmado',
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const STORE_PAYMENT_STATUS_LABELS: Record<StorePaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

/** Mapea el enum de Supabase al badge del panel admin. */
export function mapStoreOrderStatusToBadge(status: StoreOrderStatus): OrderStatus {
  switch (status) {
    case 'delivered':
      return 'entregado';
    case 'shipped':
      return 'enviado';
    case 'cancelled':
      return 'cancelado';
    case 'pending_payment':
    case 'confirmed':
    case 'processing':
    default:
      return 'procesando';
  }
}

export function formatOrderTotal(
  totalUsd: number,
  totalPen?: number | null,
  currency = 'USD',
): string {
  if (totalPen != null && totalPen > 0) {
    return `S/ ${totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'USD') {
    return `$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${totalUsd.toLocaleString('es-PE', { minimumFractionDigits: 2 })} ${currency}`;
}
