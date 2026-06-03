import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type {
  CreateRentalRequestPayload,
  RentalRequestRecord,
  RentalRequestStatus,
} from '@/types/haitech-domain';

export function useRentalRequests() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['rental-requests'],
    queryFn: () => apiFetch<{ requests: RentalRequestRecord[] }>('/api/rental-requests'),
    enabled: isAdmin,
    select: (data) => data.requests,
    refetchInterval: isAdmin ? 8000 : false,
  });
}

export function useRentalRequestMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['rental-requests'] });
  };

  const createRequest = useMutation({
    mutationFn: (payload: CreateRentalRequestPayload) =>
      apiFetch<{ request: RentalRequestRecord }>('/api/rental-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateRequest = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status?: RentalRequestStatus; notes?: string };
    }) =>
      apiFetch<{ request: RentalRequestRecord }>(`/api/rental-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/rental-requests/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { createRequest, updateRequest, deleteRequest };
}
