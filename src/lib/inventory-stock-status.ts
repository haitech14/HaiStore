/** Umbral compartido con el dashboard admin («Estado del inventario»). */
export const INVENTORY_LOW_STOCK_THRESHOLD = 5;

export type InventoryStockStatusLevel = 'out' | 'low' | 'healthy';

export function normalizeStockQuantity(stock: number): number {
  return Math.max(0, Math.floor(Number(stock) || 0));
}

export function getInventoryStockStatus(stock: number): InventoryStockStatusLevel {
  const qty = normalizeStockQuantity(stock);
  if (qty <= 0) return 'out';
  if (qty <= INVENTORY_LOW_STOCK_THRESHOLD) return 'low';
  return 'healthy';
}

/** Porcentaje de la barra (0–100) alineado con el dashboard. */
export function getInventoryStockBarPercent(stock: number): number {
  const qty = normalizeStockQuantity(stock);
  if (qty <= 0) return 0;
  if (qty <= INVENTORY_LOW_STOCK_THRESHOLD) {
    return Math.round((qty / INVENTORY_LOW_STOCK_THRESHOLD) * 100);
  }
  return 100;
}

export const INVENTORY_STOCK_STATUS_LABELS: Record<InventoryStockStatusLevel, string> = {
  out: 'Sin stock',
  low: 'Bajo stock',
  healthy: 'En stock',
};

export function isInventoryStockHealthy(stock: number): boolean {
  return getInventoryStockStatus(stock) === 'healthy';
}

export interface InventoryCategoryStockSnapshot {
  total: number;
  out: number;
  low: number;
  healthy: number;
}

export function tallyInventoryCategoryStock(
  stock: number,
): Pick<InventoryCategoryStockSnapshot, 'out' | 'low' | 'healthy'> {
  const status = getInventoryStockStatus(stock);
  if (status === 'out') return { out: 1, low: 0, healthy: 0 };
  if (status === 'low') return { out: 0, low: 1, healthy: 0 };
  return { out: 0, low: 0, healthy: 1 };
}

export function toCategoryStockPercents(snapshot: InventoryCategoryStockSnapshot) {
  const { total, out, low, healthy } = snapshot;
  if (total <= 0) {
    return { outPercent: 0, lowPercent: 0, healthyPercent: 0 };
  }
  return {
    outPercent: Math.round((out / total) * 100),
    lowPercent: Math.round((low / total) * 100),
    healthyPercent: Math.round((healthy / total) * 100),
  };
}

export function formatInventoryCategoryStockSummary(snapshot: InventoryCategoryStockSnapshot): string {
  const parts = [`${snapshot.total} prod.`];
  if (snapshot.healthy > 0) parts.push(`${snapshot.healthy} en stock`);
  if (snapshot.low > 0) parts.push(`${snapshot.low} bajo stock`);
  if (snapshot.out > 0) parts.push(`${snapshot.out} sin stock`);
  return parts.join(' · ');
}
