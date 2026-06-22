import type { PriceRole, ProductRolePrices } from '@/lib/roles';

export interface ProductVolumeRolePriceTier {
  id: string;
  range: string;
  prices: ProductRolePrices;
}

export {
  createEmptyVolumeRolePriceTier,
  normalizeVolumeRolePriceTier,
  normalizeVolumeRolePrices,
  resolveVolumeRolePricing,
  resolveVolumeRoleTierForQuantity,
  resolveVolumeRoleUnitUsd,
} from '../../shared/product-volume-role-prices.js';

export type { PriceRole };
