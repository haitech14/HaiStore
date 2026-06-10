import { isUserRole, type UserRole } from '@/lib/roles';

const VIEW_AS_ROLE_KEY = 'haistore_view_as_role';

export function readViewAsRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(VIEW_AS_ROLE_KEY);
  if (!raw) return null;
  return isUserRole(raw) && raw !== 'admin' ? raw : null;
}

export function writeViewAsRole(role: UserRole | null): void {
  if (typeof window === 'undefined') return;
  if (!role) localStorage.removeItem(VIEW_AS_ROLE_KEY);
  else localStorage.setItem(VIEW_AS_ROLE_KEY, role);
}
