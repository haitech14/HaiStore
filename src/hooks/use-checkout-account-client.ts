import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import {
  normalizeCheckoutAccountClient,
  type CheckoutAccountClientResponse,
} from '@/lib/checkout-account-client';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { isPriceRole } from '@/lib/roles';

async function fetchCheckoutAccountClient(): Promise<Partial<HaitechClientFormValues> | null> {
  const data = await apiFetch<CheckoutAccountClientResponse>('/api/customers/me');
  return normalizeCheckoutAccountClient(data.checkoutClient);
}

function buildSessionFallback(
  user: { email?: string | null; name?: string | null },
  role: string,
): Partial<HaitechClientFormValues> | null {
  return normalizeCheckoutAccountClient({
    email: user.email ?? '',
    nombreContacto: user.name?.trim() ?? '',
    nombre: user.name?.trim() ?? '',
    ...(isPriceRole(role) && role !== 'public' ? { tipoCliente: role } : {}),
  });
}

export function useCheckoutAccountClient(enabled = true) {
  const { user, role, isLoading: authLoading } = useAuth();

  const sessionFallback = useMemo(
    () => (user ? buildSessionFallback(user, role) : null),
    [user, role],
  );

  const query = useQuery({
    queryKey: ['checkout-account-client', user?.email ?? 'guest'],
    queryFn: fetchCheckoutAccountClient,
    enabled: enabled && Boolean(user) && !authLoading,
    staleTime: 60_000,
  });

  const accountClient = useMemo(() => {
    if (!user) return null;
    const merged = {
      ...(sessionFallback ?? {}),
      ...(query.data ?? {}),
    };
    return normalizeCheckoutAccountClient(merged);
  }, [query.data, sessionFallback, user]);

  return {
    accountClient,
    isLoading: authLoading || (Boolean(user) && query.isLoading),
    isFromAccount: Boolean(query.data && Object.keys(query.data).length > 0),
  };
}
