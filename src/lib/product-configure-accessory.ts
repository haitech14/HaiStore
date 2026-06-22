import { isPrinterEquipment } from '@/lib/build-product-detail';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { usdToPen } from '@/lib/utils';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

export interface ConfigureAccessoryItem {
  id: string;
  productId?: string;
  name: string;
  image: string;
  pricePen: number;
  compareAtPen?: number;
}

const DRUM_FALLBACK_IMAGE = '/categories/repuestos.png';
const TONER_FALLBACK_IMAGE = '/products/toner-418480.webp';

function isImBnA4Equipment(product: Product): boolean {
  if (product.id === '328f41ef-d935-4807-85d0-e1db5bdf73fb') return true;
  if (product.id === 'b32a43a1-09e4-49f6-8950-3639c9534700') return true;
  return /\bim\s*550\s*f\b/i.test(product.name) || /\bim\s*600\s*f\b/i.test(product.name);
}

function isDrumLikeProduct(name: string): boolean {
  return /drum|tambor|unidad de imagen|cilindro/i.test(name);
}

function catalogDrumMatch(equipment: Product, catalog: Product[]): Product | undefined {
  const keys = isImBnA4Equipment(equipment)
    ? ['im 6000', 'im 550', 'im 600', 'drum']
    : [equipment.name.replace(/\s+/g, ' ').slice(0, 20)];

  return catalog.find((row) => {
    if (row.id === equipment.id) return false;
    const haystack = `${row.name} ${row.description ?? ''}`.toLowerCase();
    return isDrumLikeProduct(haystack) && keys.some((key) => haystack.includes(key));
  });
}

function buildAccessoryFromProduct(
  product: Product,
  compareAtPen?: number,
): ConfigureAccessoryItem {
  const image = resolveProductImageUrl(product) ?? DRUM_FALLBACK_IMAGE;
  const pricePen = usdToPen(product.price);

  return {
    id: product.id,
    productId: product.id,
    name: product.name.toUpperCase().includes('DRUM') ? product.name : product.name,
    image,
    pricePen,
    ...(compareAtPen != null && compareAtPen > pricePen ? { compareAtPen } : {}),
  };
}

export function resolveRecommendedConfigureAccessory(
  equipment: Product,
  catalog: Product[],
  frequentlyBought: ProductComboItem[],
): ConfigureAccessoryItem | null {
  if (!isPrinterEquipment(equipment)) return null;

  const drumCombo = frequentlyBought.find((item) => isDrumLikeProduct(item.name));
  if (drumCombo) {
    return {
      id: drumCombo.id,
      ...(drumCombo.productId ? { productId: drumCombo.productId } : {}),
      name: drumCombo.name,
      image: drumCombo.image || DRUM_FALLBACK_IMAGE,
      pricePen: drumCombo.pricePen,
      compareAtPen: Math.round(drumCombo.pricePen * 3.46),
    };
  }

  const catalogDrum = catalogDrumMatch(equipment, catalog);
  if (catalogDrum) {
    const pricePen = usdToPen(catalogDrum.price);
    return buildAccessoryFromProduct(catalogDrum, Math.round(pricePen * 3.46));
  }

  if (isImBnA4Equipment(equipment)) {
    return {
      id: 'combo-drum-im-6000',
      name: 'DRUM UNIT IM 6000',
      image: TONER_FALLBACK_IMAGE,
      pricePen: 455,
      compareAtPen: 1574,
    };
  }

  const fallback = frequentlyBought[0];
  if (!fallback) return null;

  return {
    id: fallback.id,
    ...(fallback.productId ? { productId: fallback.productId } : {}),
    name: fallback.name,
    image: fallback.image || DRUM_FALLBACK_IMAGE,
    pricePen: fallback.pricePen,
  };
}

export function resolveIncludedTonerImage(optionImage?: string): string {
  return optionImage ?? TONER_FALLBACK_IMAGE;
}
