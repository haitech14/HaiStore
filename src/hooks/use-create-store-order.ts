import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { CreateStoreOrderPayload } from '@/types/haitech-domain';
import type { StoreOrder } from '@/types/store';

export function useCreateStoreOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStoreOrderPayload) =>
      apiFetch<{ order: StoreOrder }>('/api/orders/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
    },
  });
}
