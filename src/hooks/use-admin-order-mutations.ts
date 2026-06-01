import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { UpdateSaleOrderPayload } from '@/types/sale-order-admin';
import type { StoreOrder } from '@/types/store';

export async function fetchAdminOrderDetail(id: string): Promise<StoreOrder> {
  const payload = await apiFetch<{ order: StoreOrder }>(`/api/orders/admin/${id}`);
  return payload.order;
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateSaleOrderPayload }) => {
      const result = await apiFetch<{ order: StoreOrder }>(`/api/orders/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return result.order;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-orders-recent'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<{ ok: boolean }>(`/api/orders/admin/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-orders-recent'] });
    },
  });
}
