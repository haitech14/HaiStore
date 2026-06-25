import type { CartItem } from '@/types/product';

const CART_STORAGE_KEY = 'haistore_cart_v1';

interface StoredCartItem {
  product: CartItem['product'];
  quantity: number;
  lineId: string;
  configuration?: CartItem['configuration'];
  volumeUnitPriceUsd?: number;
  preparationType?: CartItem['preparationType'];
}

export function readStoredCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.lineId === 'string' &&
          item.product &&
          typeof item.product.id === 'string' &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0,
      )
      .map(
        (item): CartItem => ({
          product: item.product,
          quantity: item.quantity,
          lineId: item.lineId,
          ...(item.configuration ? { configuration: item.configuration } : {}),
          ...(item.volumeUnitPriceUsd != null ? { volumeUnitPriceUsd: item.volumeUnitPriceUsd } : {}),
          ...(item.preparationType ? { preparationType: item.preparationType } : {}),
        }),
      );
  } catch {
    return [];
  }
}

export function writeStoredCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    const payload: StoredCartItem[] = items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineId: item.lineId,
      ...(item.configuration ? { configuration: item.configuration } : {}),
      ...(item.volumeUnitPriceUsd != null ? { volumeUnitPriceUsd: item.volumeUnitPriceUsd } : {}),
      ...(item.preparationType ? { preparationType: item.preparationType } : {}),
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage lleno o bloqueado
  }
}

export function clearStoredCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}
