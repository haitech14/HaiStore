import { PRICE_ROLES_EDIT_ORDER } from '@/types/product';
import type { PriceRole } from '@/types/product';

export type ServicePriceListColumnId = 'code' | 'name' | 'category' | PriceRole;

export const DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER: ServicePriceListColumnId[] = [
  'code',
  'name',
  'category',
  ...PRICE_ROLES_EDIT_ORDER,
];

const STORAGE_KEY = 'haistore-service-price-list-column-order';

function isPriceRoleColumn(id: string): id is PriceRole {
  return (PRICE_ROLES_EDIT_ORDER as readonly string[]).includes(id);
}

function isValidColumnId(id: string): id is ServicePriceListColumnId {
  return id === 'code' || id === 'name' || id === 'category' || isPriceRoleColumn(id);
}

export function loadServicePriceListColumnOrder(): ServicePriceListColumnId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER];
    const filtered = parsed.filter(
      (id): id is ServicePriceListColumnId => typeof id === 'string' && isValidColumnId(id),
    );
    const missing = DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER.filter((id) => !filtered.includes(id));
    return filtered.length > 0 ? [...filtered, ...missing] : [...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER];
  } catch {
    return [...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER];
  }
}

export function saveServicePriceListColumnOrder(order: ServicePriceListColumnId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function reorderServicePriceListColumns(
  order: ServicePriceListColumnId[],
  draggedId: ServicePriceListColumnId,
  targetId: ServicePriceListColumnId,
): ServicePriceListColumnId[] {
  const next = [...order];
  const from = next.indexOf(draggedId);
  const to = next.indexOf(targetId);
  if (from === -1 || to === -1 || from === to) return order;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function isServicePriceListPriceColumn(
  columnId: ServicePriceListColumnId,
): columnId is PriceRole {
  return isPriceRoleColumn(columnId);
}
