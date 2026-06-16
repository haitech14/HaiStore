import { isPrinterEquipment } from '@/lib/build-product-detail';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';
import { usdToPen } from '@/lib/utils';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isConsumableProduct(product: Product): boolean {
  const haystack = normalizeText(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''}`,
  );

  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }

  return (
    haystack.includes('toner') ||
    haystack.includes('cartucho') ||
    haystack.includes('suministro') ||
    haystack.includes('tambor') ||
    haystack.includes('unidad de imagen') ||
    haystack.includes('repuesto')
  );
}

function extractSearchKeys(equipment: Product): string[] {
  const keys = new Set<string>();
  const name = equipment.name;

  const regexes = [
    /\bIM\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\bIM\s+\d{3,4}[A-Z]?\b/gi,
    /\bMP\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\b[A-Z]{1,5}\s*-?\s*\d{3,4}[A-Z]{0,4}\b/g,
    /\b[A-Z]{1,5}\d{3,4}[A-Z]{0,4}\b/g,
  ];

  for (const pattern of regexes) {
    for (const match of name.matchAll(pattern)) {
      const raw = match[0].trim();
      keys.add(normalizeText(raw));
      keys.add(raw.replace(/\s+/g, '').toLowerCase());
    }
  }

  const withoutBrand = equipment.brand
    ? name.replace(new RegExp(equipment.brand, 'i'), '').trim()
    : name.trim();
  if (withoutBrand.length >= 4) {
    keys.add(normalizeText(withoutBrand));
    keys.add(withoutBrand.replace(/\s+/g, '').toLowerCase());
  }

  keys.add(equipment.id.replace(/-/g, ' '));

  return [...keys].filter((key) => key.replace(/\s+/g, '').length >= 3);
}

function consumableMatchesEquipment(consumable: Product, keys: string[]): boolean {
  const haystack = normalizeText(`${consumable.name} ${consumable.description ?? ''}`);
  const compactHaystack = haystack.replace(/\s+/g, '');

  return keys.some((key) => {
    const compactKey = key.replace(/\s+/g, '');
    if (compactKey.length < 3) return false;
    return haystack.includes(key) || compactHaystack.includes(compactKey);
  });
}

function productToComboItem(product: Product, defaultSelected: boolean): ProductComboItem {
  const image = buildProductImageCandidates(product)[0] ?? '/categories/toner-suministros.png';
  return {
    id: product.id,
    productId: product.id,
    name: product.name,
    image,
    pricePen: usdToPen(product.price),
    priceUsd: product.price,
    defaultSelected,
  };
}

const FALLBACK_BY_EQUIPMENT_ID: Record<string, ProductComboItem> = {
  'ricoh-im-430f': {
    id: 'combo-toner-430f',
    name: 'Tóner RICOH IM 430F (15,500 páginas)',
    image: '/categories/toner-suministros.png',
    pricePen: 680,
    defaultSelected: true,
  },
};

export function resolveFrequentlyBoughtItems(
  equipment: Product,
  catalog: Product[],
): ProductComboItem[] {
  if (!isPrinterEquipment(equipment)) return [];

  const keys = extractSearchKeys(equipment);
  const matched = catalog
    .filter((row) => row.id !== equipment.id)
    .filter(isConsumableProduct)
    .filter((row) => consumableMatchesEquipment(row, keys))
    .slice(0, 6);

  if (matched.length > 0) {
    return matched.map((row, index) => productToComboItem(row, index === 0));
  }

  const fallback = FALLBACK_BY_EQUIPMENT_ID[equipment.id];
  if (fallback) return [fallback];

  const brand = (equipment.brand ?? '').toLowerCase();
  if (brand) {
    const brandToners = catalog
      .filter((row) => row.id !== equipment.id)
      .filter(isConsumableProduct)
      .filter((row) => (row.brand ?? '').toLowerCase() === brand)
      .filter((row) => {
        const name = normalizeText(row.name);
        return name.includes('toner') || name.includes('cartucho');
      })
      .slice(0, 3);

    if (brandToners.length > 0) {
      return brandToners.map((row, index) => productToComboItem(row, index === 0));
    }
  }

  return [];
}
