import type { FeaturedProduct } from '@/data/featured-products';
import {
  EQUIPMENT_CONDITION_LABELS,
  inferProductConditionFromText,
  type ProductCondition,
} from '@/lib/product-condition';
import type { Product, ProductAttribute } from '@/types/product';

export const MAX_COMPARE_PRODUCTS = 4;

export const COMPARE_SPEC_ROWS = [
  { key: 'modelo', label: 'Modelo' },
  { key: 'precio', label: 'Precio' },
  { key: 'condicion', label: 'Condición' },
  { key: 'velocidad', label: 'Velocidad' },
  { key: 'color', label: 'Color / B/N' },
  { key: 'formato', label: 'Tamaño A3/A4' },
  { key: 'funciones', label: 'Funciones' },
  { key: 'garantia', label: 'Garantía' },
  { key: 'recomendado', label: 'Recomendado para' },
] as const;

export type CompareSpecRowKey = (typeof COMPARE_SPEC_ROWS)[number]['key'];

export interface CompareProductItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  code?: string | null;
  description?: string | null;
  price: number;
  image: string | null;
  attributes: ProductAttribute[];
}

export function featuredToCompareItem(product: FeaturedProduct): CompareProductItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    code: product.code ?? null,
    price: product.price,
    image: product.image || null,
    attributes: product.attributes ?? [],
  };
}

export function productToCompareItem(product: Product): CompareProductItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    code: product.code ?? null,
    description: product.description,
    price: product.price,
    image: product.image_url,
    attributes: product.attributes ?? [],
  };
}

function normalizeAttributeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findAttributeValue(product: CompareProductItem, ...names: string[]): string | null {
  for (const name of names) {
    const key = normalizeAttributeKey(name);
    const match = product.attributes.find((attr) => normalizeAttributeKey(attr.name) === key);
    const value = match?.value?.trim();
    if (value) return value;
  }
  return null;
}

function inferConditionLabel(product: CompareProductItem): string {
  const haystack = `${product.category} ${product.name}`;
  const condition = inferProductConditionFromText(haystack);
  if (!condition) return '—';
  return formatConditionLabel(condition);
}

function formatConditionLabel(condition: ProductCondition): string {
  return EQUIPMENT_CONDITION_LABELS[condition] ?? condition;
}

function inferSpeed(product: CompareProductItem): string | null {
  const fromAttr = findAttributeValue(product, 'Velocidad', 'Velocidad de impresión');
  if (fromAttr) return fromAttr;

  const haystack = `${product.description ?? ''} ${product.name}`;
  const ppmMatch = haystack.match(/(\d+)\s*ppm/i);
  return ppmMatch ? `${ppmMatch[1]} ppm` : null;
}

function buildFunctionsSummary(product: CompareProductItem): string | null {
  const parts: string[] = [];
  const duplex = findAttributeValue(product, 'Impresión dúplex', 'Dúplex');
  const adf = findAttributeValue(product, 'Alimentador (ADF)', 'ADF');
  const connectivity = findAttributeValue(product, 'Conectividad');
  const technology = findAttributeValue(product, 'Tecnología');

  if (technology) parts.push(technology);
  if (duplex) parts.push(`Dúplex: ${duplex}`);
  if (adf) parts.push(`ADF: ${adf}`);
  if (connectivity) parts.push(connectivity);

  const category = product.category.toLowerCase();
  if (parts.length === 0 && category.includes('multifuncional')) {
    parts.push('Impresión, copia y escaneo');
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

function formatCompareModel(product: CompareProductItem): string {
  return product.name.trim() || '—';
}

export function getCompareSpecValue(
  product: CompareProductItem,
  rowKey: CompareSpecRowKey,
): string {
  switch (rowKey) {
    case 'modelo':
      return formatCompareModel(product);
    case 'precio':
      return String(product.price);
    case 'condicion':
      return inferConditionLabel(product);
    case 'velocidad':
      return inferSpeed(product) ?? '—';
    case 'color':
      return findAttributeValue(product, 'Color', 'Color / B/N') ?? '—';
    case 'formato':
      return findAttributeValue(product, 'Formato papel', 'Tamaño', 'Formato') ?? '—';
    case 'funciones':
      return buildFunctionsSummary(product) ?? '—';
    case 'garantia':
      return findAttributeValue(product, 'Garantía', 'Garantia') ?? 'Consultar con asesor';
    case 'recomendado':
      return (
        findAttributeValue(
          product,
          'Producción',
          'Recomendado para',
          'Uso recomendado',
          'Volumen',
        ) ?? '—'
      );
    default: {
      const exhaustive: never = rowKey;
      return exhaustive;
    }
  }
}
