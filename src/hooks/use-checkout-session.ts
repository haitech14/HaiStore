import { useMutation, useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type {
  CheckoutOrderStatusResponse,
  CheckoutPaymentOptions,
  CheckoutSessionResponse,
} from '@/types/checkout';

export function useCheckoutSession() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch<CheckoutSessionResponse>('/api/checkout/session', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

export function useCheckoutPaymentOptions() {
  return useQuery({
    queryKey: ['checkout', 'payment-options'],
    queryFn: () => apiFetch<CheckoutPaymentOptions>('/api/checkout/payment-options'),
    staleTime: 60_000,
  });
}

export function useCulqiCharge() {
  return useMutation({
    mutationFn: (payload: { orderId: string; token: string; email?: string }) =>
      apiFetch<{ order: { id: string; order_number: string; payment_status: string } }>(
        '/api/checkout/culqi/charge',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      ),
  });
}

export function useMercadoPagoPreference() {
  return useMutation({
    mutationFn: (payload: { orderId: string; email?: string }) =>
      apiFetch<{ initPoint: string | null; preferenceId?: string; order: { order_number: string } }>(
        '/api/checkout/mercadopago/preference',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      ),
  });
}

export function useCheckoutOrderStatus(orderNumber: string | null, enabled = true) {
  return useQuery({
    queryKey: ['checkout', 'order-status', orderNumber],
    queryFn: () =>
      apiFetch<CheckoutOrderStatusResponse>(
        `/api/orders/status/${encodeURIComponent(orderNumber ?? '')}`,
      ),
    enabled: Boolean(orderNumber) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.order?.payment_status;
      return status === 'pending' ? 3000 : false;
    },
  });
}
