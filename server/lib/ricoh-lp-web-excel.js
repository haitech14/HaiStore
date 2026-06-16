import XLSX from 'xlsx';

import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { formatRendLabel } from './repuestos-products-excel.js';
import { moveParentheticalSuffixToEnd } from '../../shared/inventory-product-name.js';
import {
  classifyTonerInventoryCategory,
  roundSalePriceToNinety,
  SUPPLIER_RICOH_PERU,
} from './toner-products-excel.js';

export const CATEGORY_ACCESORIOS = 'Accesorios';
export const ACCESORIOS_DEFAULT_IMAGE = '/categories/accesorios-impresoras.png';
export const TONER_DEFAULT_IMAGE = '/categories/toner-suministros.png';
export const DEFAULT_SHEET_NAME = 'SEP 01 2025';

const EXCLUDED_CLASSIFICATIONS = new Set(['Mainframe', 'Instalación']);
const ALLOWED_CLASSIFICATIONS = new Set([
  'Accesorios',
  'Consumible',
  'Consumibles',
  'SUPPLIES',
  'PARTS',
]);

const MODELO_SEPARATOR = ' / ';
const DATA_START_ROW = 3;

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
export function ricohLpProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `ricoh-lp-${slug || 'sin-codigo'}`;
}

/**
 * @param {string[]} modelos
 */
export function concatenateRicohModelos(modelos) {
  const seen = new Set();
  /** @type {string[]} */
  const unique = [];

  for (const raw of modelos) {
    const modelo = String(raw ?? '').trim();
    if (!modelo) continue;
    const key = modelo.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(modelo);
  }

  return unique.join(MODELO_SEPARATOR);
}

/**
 * @param {{ titulo: string; yield: unknown; modelos: string }}
 */
export function buildRicohLpProductName({ titulo, yield: yieldValue, modelos }) {
  let name = titulo.trim();
  const yieldNum = parseNumber(yieldValue);
  const rendLabel = formatRendLabel(yieldValue);
  if (yieldNum > 0 && rendLabel) {
    name = `${name} (${rendLabel} 5%-A4)`;
  }
  const modelSuffix = modelos.trim();
  if (modelSuffix) {
    name = `${name} — ${modelSuffix}`;
  }
  return moveParentheticalSuffixToEnd(name);
}

/**
 * @param {string} classification
 * @param {string} titulo
 */
function resolveInventoryCategory(classification, titulo) {
  if (classification === 'Accesorios') {
    return CATEGORY_ACCESORIOS;
  }
  return classifyTonerInventoryCategory(titulo);
}

/**
 * @param {number} compra
 */
function buildRicohLpSuppliers(compra) {
  const canalPrice = parseNumber(compra);
  if (canalPrice <= 0) {
    return [];
  }
  return [{ name: SUPPLIER_RICOH_PERU, purchase_price_usd: canalPrice }];
}

/**
 * @typedef {Object} RicohLpRowEntry
 * @property {string} classification
 * @property {string} modelo
 * @property {string} code
 * @property {string} titulo
 * @property {unknown} yield
 * @property {number} publico
 * @property {number} compra
 */

/**
 * @param {Array<unknown>} row
 * @returns {RicohLpRowEntry | null}
 */
export function mapRicohLpRowToEntry(row) {
  const classification = String(row[0] ?? '').trim();
  if (!classification || EXCLUDED_CLASSIFICATIONS.has(classification)) {
    return null;
  }
  if (!ALLOWED_CLASSIFICATIONS.has(classification)) {
    return null;
  }

  const modelo = String(row[1] ?? '').trim();
  const code = String(row[2] ?? '').trim();
  const titulo = String(row[3] ?? '').trim();
  const yieldValue = row[12] !== '' && row[12] != null ? row[12] : '';
  const publico = parseNumber(row[7]);
  const compra = parseNumber(row[14]);

  if (!code || code === '0' || !titulo) {
    return null;
  }

  return {
    classification,
    modelo,
    code,
    titulo,
    yield: yieldValue,
    publico,
    compra,
  };
}

/**
 * @param {RicohLpRowEntry[]} entries
 */
export function groupRicohLpEntriesByCode(entries) {
  /** @type {Map<string, RicohLpRowEntry[]>} */
  const byCode = new Map();

  for (const entry of entries) {
    const key = entry.code.trim().toLowerCase();
    const group = byCode.get(key);
    if (group) {
      group.push(entry);
    } else {
      byCode.set(key, [entry]);
    }
  }

  return byCode;
}

/**
 * @param {RicohLpRowEntry[]} group
 */
export function mergeRicohLpEntriesToProduct(group) {
  if (!group.length) return null;

  const priceSource =
    group.find((entry) => entry.publico > 0) ??
    group.find((entry) => entry.compra > 0) ??
    group[0];

  const tituloSource =
    group.find((entry) => entry.titulo.trim()) ?? group[0];

  const yieldSource =
    group.find((entry) => parseNumber(entry.yield) > 0) ?? tituloSource;

  const modelosConcat = concatenateRicohModelos(group.map((entry) => entry.modelo));
  const category = resolveInventoryCategory(
    tituloSource.classification,
    tituloSource.titulo,
  );

  const name = buildRicohLpProductName({
    titulo: tituloSource.titulo,
    yield: yieldSource.yield,
    modelos: modelosConcat,
  });

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modelosConcat) {
    attributes.push({ name: 'Modelo de equipo', value: modelosConcat });
  }
  const rendLabel = formatRendLabel(yieldSource.yield);
  if (rendLabel && parseNumber(yieldSource.yield) > 0) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }

  const publicPrice = roundSalePriceToNinety(priceSource.publico);
  const compraPrice = parseNumber(priceSource.compra);
  const suppliers = buildRicohLpSuppliers(compraPrice);

  const defaultImage =
    category === CATEGORY_ACCESORIOS ? ACCESORIOS_DEFAULT_IMAGE : TONER_DEFAULT_IMAGE;

  return normalizeProductInput({
    id: ricohLpProductIdFromCode(tituloSource.code),
    code: tituloSource.code,
    name,
    description: name,
    brand: 'Ricoh',
    category,
    currency: 'USD',
    stock: 0,
    image_url: defaultImage,
    gallery: [defaultImage],
    prices: {
      public: publicPrice,
      tecnico: 0,
      distribuidor: 0,
      mayorista: 0,
    },
    purchase_price_usd: compraPrice > 0 ? compraPrice : 0,
    attributes: normalizeAttributes(attributes),
    suppliers,
  });
}

/**
 * @param {Array<Array<unknown>>} rows
 * @returns {RicohLpRowEntry[]}
 */
export function collectRicohLpRowEntries(rows) {
  /** @type {RicohLpRowEntry[]} */
  const entries = [];

  for (let index = DATA_START_ROW; index < rows.length; index += 1) {
    const entry = mapRicohLpRowToEntry(rows[index]);
    if (entry) entries.push(entry);
  }

  return entries;
}

/**
 * @param {Buffer} buffer
 * @param {string} [sheetName]
 */
export function parseRicohLpWebWorkbook(buffer, sheetName = DEFAULT_SHEET_NAME) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const resolvedSheet =
    sheetName && workbook.SheetNames.includes(sheetName)
      ? sheetName
      : workbook.SheetNames[0];
  if (!resolvedSheet) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[resolvedSheet], {
    header: 1,
    defval: '',
  });

  const entries = collectRicohLpRowEntries(rows);
  const byCode = groupRicohLpEntriesByCode(entries);

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];

  for (const group of byCode.values()) {
    const product = mergeRicohLpEntriesToProduct(group);
    if (product) products.push(product);
  }

  return products;
}
