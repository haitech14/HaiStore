import type { PriceRole, ProductRolePrices } from '../src/lib/roles';

export interface ProductVolumeRolePriceTier {
  id: string;
  range: string;
  prices: ProductRolePrices;
}

export function normalizeVolumeRolePriceTier(raw: unknown): ProductVolumeRolePriceTier | null;
export function normalizeVolumeRolePrices(input: unknown): ProductVolumeRolePriceTier[];
export function resolveVolumeRoleTierForQuantity(
  quantity: number,
  tiers: ProductVolumeRolePriceTier[],
): ProductVolumeRolePriceTier | null;
export function resolveVolumeRoleUnitUsd(
  quantity: number,
  role: PriceRole,
  basePrices: ProductRolePrices,
  tiers: ProductVolumeRolePriceTier[],
): number;
export function resolveVolumeRolePricing(
  quantity: number,
  role: PriceRole,
  basePrices: ProductRolePrices,
  tiers: ProductVolumeRolePriceTier[],
): {
  tier: ProductVolumeRolePriceTier | null;
  unitUsd: number;
  totalUsd: number;
  baseTotalUsd: number;
  savingsUsd: number;
};
export function createEmptyVolumeRolePriceTier(): ProductVolumeRolePriceTier;
