import { useMutation } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { CreateStoreOrderPayload } from '@/types/haitech-domain';
import type { StoreOrder } from '@/types/store';

export function useCheckoutOrder() {
  return useMutation({
    mutationFn: (payload: CreateStoreOrderPayload) =>
      apiFetch<{ order: StoreOrder }>('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}
