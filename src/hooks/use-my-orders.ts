import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { StoreOrder } from '@/types/store';

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => apiFetch<{ orders: StoreOrder[]; source: string }>('/api/orders/my'),
    enabled,
    staleTime: 30_000,
  });
}
