import {
  PRICE_ROLES_EDIT_ORDER,
  resolvePriceRole,
  type PriceRole,
  type UserRole,
} from '@/lib/roles';

/** Columnas de precio visibles en la tabla de categoría según sesión. */
export function getCategoryTableVisiblePriceRoles(
  isAdmin: boolean,
  userRole: UserRole | 'public',
): readonly PriceRole[] {
  if (isAdmin) return PRICE_ROLES_EDIT_ORDER;
  return [resolvePriceRole(userRole)];
}

export function countCategoryTableColumns(isAdmin: boolean, userRole: UserRole | 'public'): number {
  const specColumns = 4;
  const priceColumns = getCategoryTableVisiblePriceRoles(isAdmin, userRole).length;
  const purchaseColumn = isAdmin ? 1 : 0;
  return 1 + 1 + specColumns + 1 + 1 + purchaseColumn + priceColumns + 1;
}
