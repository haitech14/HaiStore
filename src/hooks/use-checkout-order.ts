import { useMutation } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { CheckoutSessionResponse } from '@/types/checkout';
import type { CreateStoreOrderPayload } from '@/types/haitech-domain';

/** @deprecated Usar useCheckoutSession para el checkout multi-paso. */
export function useCheckoutOrder() {
  return useMutation({
    mutationFn: (payload: CreateStoreOrderPayload & { paymentProvider?: string }) =>
      apiFetch<CheckoutSessionResponse>('/api/checkout/session', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          paymentProvider: payload.paymentProvider ?? 'manual',
        }),
      }),
  });
}
