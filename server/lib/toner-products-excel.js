import XLSX from 'xlsx';

import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { formatRendLabel } from './repuestos-products-excel.js';

export const CATEGORY_ORIGINAL = 'Toner originales';
export const CATEGORY_TONER = 'Toner';
export const CATEGORY_SUMINISTROS = 'Suministros';
export const SUPPLIER_RICOH_PERU = 'RICOH DEL PERU SAC';

/**
 * @param {string} description
 * @returns {'Suministros' | 'Toner originales' | 'Toner'}
 */
export function classifyTonerInventoryCategory(description) {
  const desc = String(description ?? '').trim();
  const upper = desc.toUpperCase();

  if (
    upper.includes('STAPLE') ||
    upper.includes('GRAPA') ||
    upper.includes('GRAPAS') ||
    /\bREFILL\s+STAPLE\b/.test(upper)
  ) {
    return CATEGORY_SUMINISTROS;
  }

  if (upper.includes('->') || upper.includes('COMPATIBLE') || /\bCOMPAT\b/.test(upper)) {
    return CATEGORY_TONER;
  }

  if (
    (/PRINT\s*CARTRIDGE|PRINT\s*CART|\bTONER\b|CARTRIDGE/i.test(desc) && !upper.includes('->')) ||
    /^RICOH\b/i.test(desc)
  ) {
    return CATEGORY_TONER;
  }

  return CATEGORY_TONER;
}

/**
 * Precio de venta: décima más cercana terminada en .90 (p. ej. 82.42 → 82.90).
 * @param {number} value
 */
export function roundSalePriceToNinety(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.ceil(n - 0.9) + 0.9;
}

/**
 * @param {unknown} value
 */
function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * @param {string} code
 */
export function tonerProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `toner-${slug || 'sin-codigo'}`;
}

/**
 * @param {{ descripcion: string; rend: unknown; modelo: string }}
 */
export function buildTonerProductName({ descripcion, rend, modelo }) {
  let name = descripcion.trim();
  const rendLabel = formatRendLabel(rend);
  if (rendLabel) {
    name = `${name} (Rend ${rendLabel})`;
  }
  const modelSuffix = modelo.trim();
  if (modelSuffix && !name.toUpperCase().includes(modelSuffix.toUpperCase().slice(0, 12))) {
    name = `${name} — ${modelSuffix}`;
  }
  return name;
}

/**
 * @param {number} canal
 * @param {number} oferta
 */
function buildTonerSuppliers(canal, oferta) {
  /** @type {Array<{ name: string; purchase_price_usd: number }>} */
  const suppliers = [];
  const canalPrice = parseNumber(canal);
  const ofertaPrice = parseNumber(oferta);

  if (canalPrice > 0) {
    suppliers.push({ name: SUPPLIER_RICOH_PERU, purchase_price_usd: canalPrice });
  }
  if (ofertaPrice > 0) {
    suppliers.push({ name: SUPPLIER_RICOH_PERU, purchase_price_usd: ofertaPrice });
  }

  return suppliers;
}

/**
 * @param {Array<unknown>} row
 * @param {string} carryModelo
 * @returns {{ product: ReturnType<typeof normalizeProductInput> | null; carryModelo: string }}
 */
export function mapTonerExcelRowToProduct(row, carryModelo = '') {
  const modeloCell = String(row[0] ?? '').trim();
  const carryModeloNext = modeloCell || carryModelo;

  const code = String(row[1] ?? '').trim();
  const rend = row[2] !== '' && row[2] != null ? row[2] : '';
  const description = String(row[3] ?? '').trim();
  const publicoRaw = parseNumber(row[4]);
  const distribuidorRaw = parseNumber(row[5]);
  const mayoristaRaw = parseNumber(row[6]);
  const canal = parseNumber(row[7]);
  const oferta = parseNumber(row[8]);

  if (!code || !description) {
    return { product: null, carryModelo: carryModeloNext };
  }

  const category = classifyTonerInventoryCategory(description);
  const upper = description.toUpperCase();
  const isCartridgeOriginal =
    (/PRINT\s*CARTRIDGE|PRINT\s*CART|\bTONER\b|CARTRIDGE/i.test(description) &&
      !upper.includes('->')) ||
    /^RICOH\b/i.test(description);
  const isOriginal = category === CATEGORY_SUMINISTROS || isCartridgeOriginal;
  /** En suministros (grapas) no heredar modelo de filas de tóner anteriores. */
  const modeloForProduct =
    category === CATEGORY_SUMINISTROS ? modeloCell : carryModeloNext;

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modeloForProduct) {
    attributes.push({ name: 'Modelo de equipo', value: modeloForProduct });
  }
  const rendLabel = formatRendLabel(rend);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }

  const distRounded = roundSalePriceToNinety(distribuidorRaw);
  const prices = {
    public: roundSalePriceToNinety(publicoRaw),
    tecnico: distRounded,
    distribuidor: distRounded,
    mayorista: roundSalePriceToNinety(mayoristaRaw),
  };

  const suppliers = buildTonerSuppliers(canal, oferta);
  const name = buildTonerProductName({
    descripcion: description,
    rend,
    modelo: modeloForProduct,
  });

  return {
    product: normalizeProductInput({
      id: tonerProductIdFromCode(code),
      code,
      name,
      description: name,
      brand: isOriginal ? 'Ricoh' : null,
      category,
      currency: 'USD',
      stock: 0,
      image_url: '/categories/toner-suministros.png',
      gallery: ['/categories/toner-suministros.png'],
      prices,
      purchase_price_usd: canal > 0 ? canal : 0,
      attributes: normalizeAttributes(attributes),
      suppliers,
    }),
    carryModelo: category === CATEGORY_SUMINISTROS ? '' : carryModeloNext,
  };
}

/**
 * @param {Buffer} buffer
 */
export function parseTonerProductsWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  let carryModelo = '';

  for (let index = 1; index < rows.length; index += 1) {
    const { product, carryModelo: nextModelo } = mapTonerExcelRowToProduct(rows[index], carryModelo);
    carryModelo = nextModelo;
    if (product) products.push(product);
  }

  return products;
}
