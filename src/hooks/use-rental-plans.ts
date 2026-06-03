import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { RentalPlanConfig } from '@/types/rental-plan';

export function useRentalPlans(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? false;

  return useQuery({
    queryKey: ['rental-plans', activeOnly ? 'active' : 'all'],
    queryFn: async () => {
      const suffix = activeOnly ? '?active=1' : '';
      const data = await apiFetch<{ plans: RentalPlanConfig[] }>(`/api/rental-plans${suffix}`);
      return data.plans;
    },
    staleTime: 1000 * 15,
  });
}

export function useRentalPlansMutations() {
  const queryClient = useQueryClient();

  const savePlans = useMutation({
    mutationFn: (plans: RentalPlanConfig[]) =>
      apiFetch<{ ok: boolean; plans: RentalPlanConfig[] }>('/api/rental-plans', {
        method: 'PUT',
        body: JSON.stringify({ plans }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rental-plans'] });
    },
  });

  return { savePlans };
}
