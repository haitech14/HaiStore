import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

export function useCompanySettings() {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      try {
        return await apiFetch<CompanySettings>('/api/settings/company');
      } catch {
        return DEFAULT_COMPANY_SETTINGS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanySettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompanySettings) =>
      apiFetch<CompanySettings>('/api/settings/company', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['company-settings'], data);
    },
  });
}
