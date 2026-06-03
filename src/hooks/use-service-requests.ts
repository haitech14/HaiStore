import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type {
  CreateServiceRequestPayload,
  ServiceCategoryRecord,
  ServiceRequestRecord,
  ServiceRequestStatus,
} from '@/types/haitech-domain';

export function useServiceRequests() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['service-requests'],
    queryFn: () => apiFetch<{ requests: ServiceRequestRecord[] }>('/api/service-requests'),
    enabled: isAdmin,
    select: (data) => data.requests,
    refetchInterval: isAdmin ? 8000 : false,
  });
}

export function useServiceCategories() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () =>
      apiFetch<{ categories: ServiceCategoryRecord[] }>('/api/service-requests/categories'),
    enabled: isAdmin,
    select: (data) => data.categories,
  });
}

export function useServiceCategoryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['service-categories'] });
  };

  const updateCategory = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Pick<ServiceCategoryRecord, 'name' | 'description' | 'active'>>;
    }) =>
      apiFetch<{ category: ServiceCategoryRecord }>(`/api/service-requests/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  return { updateCategory };
}

export function useServiceRequestMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['service-requests'] });
  };

  const createRequest = useMutation({
    mutationFn: (payload: CreateServiceRequestPayload) =>
      apiFetch<{ request: ServiceRequestRecord }>('/api/service-requests', {
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
      payload: { status?: ServiceRequestStatus; description?: string; scheduledAt?: string };
    }) =>
      apiFetch<{ request: ServiceRequestRecord }>(`/api/service-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/service-requests/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { createRequest, updateRequest, deleteRequest };
}
