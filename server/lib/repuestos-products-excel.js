import XLSX from 'xlsx';

import { normalizeProductCode } from '../../shared/product-code-prefix.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';

export const REPUESTOS_CATEGORY = 'Repuestos';
export const SUPPLIER_RICOH = 'RICOH DEL PERU S.A.C.';
export const SUPPLIER_ROSS = 'CORPORACION ROSS';

const MODELO_SEPARATOR = ' · ';

/**
 * @param {unknown} value
 */
function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * @param {unknown} value
 */
export function formatRendLabel(value) {
  if (value === '' || value == null) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }
  return String(value).trim();
}

/**
 * @param {string[]} modelos
 */
export function concatenateModelos(modelos) {
  const seen = new Set();
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
 * @param {{ descripcion: string; rend: unknown; modelo: string }}
 */
export function buildRepuestoName({ descripcion, rend, modelo }) {
  let name = descripcion.trim();
  const rendLabel = formatRendLabel(rend);
  if (rendLabel) {
    name = `${name} — Rend ${rendLabel}`;
  }
  const modelSuffix = modelo.trim();
  if (modelSuffix) {
    name = `${name} — ${modelSuffix}`;
  }
  return name;
}

/**
 * @param {string} baseDescripcion
 * @param {string} modelosConcat
 */
export function buildRepuestoDescription(baseDescripcion, modelosConcat) {
  const base = baseDescripcion.trim();
  const modelos = modelosConcat.trim();
  if (!modelos) return base;
  if (!base) return modelos;
  return `${base} — ${modelos}`;
}

/**
 * @param {string} code
 */
export function repuestoProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `repuesto-${slug || 'sin-codigo'}`;
}

/**
 * @param {number} canal
 */
function buildRepuestoSuppliers(canal) {
  const canalPrice = Math.max(0, parseNumber(canal));
  if (canalPrice <= 0) {
    return [];
  }

  return [
    { name: SUPPLIER_RICOH, purchase_price_usd: canalPrice },
    { name: SUPPLIER_ROSS, purchase_price_usd: Math.round(canalPrice * 1.1 * 100) / 100 },
  ];
}

/**
 * @typedef {Object} RepuestoRowEntry
 * @property {string} code
 * @property {string} descripcion
 * @property {unknown} rend
 * @property {string} modelo
 * @property {number} publico
 * @property {number} dist
 * @property {number} mayo
 * @property {number} canal
 */

/**
 * @param {Array<unknown>} row
 * @param {string} carryModelo
 * @returns {{ entry: RepuestoRowEntry | null; carryModelo: string }}
 */
export function mapRepuestosExcelRowToEntry(row, carryModelo = '') {
  const modeloCell = String(row[0] ?? '').trim();
  const carryModeloNext = modeloCell || carryModelo;

  const code = normalizeProductCode(String(row[1] ?? '').trim());
  const descripcion = String(row[2] ?? '').trim();

  if (!code || !descripcion) {
    return { entry: null, carryModelo: carryModeloNext };
  }

  return {
    entry: {
      code,
      descripcion,
      rend: row[3],
      modelo: carryModeloNext,
      publico: parseNumber(row[4]),
      dist: parseNumber(row[5]),
      mayo: parseNumber(row[6]),
      canal: parseNumber(row[7]),
    },
    carryModelo: carryModeloNext,
  };
}

/**
 * @param {RepuestoRowEntry[]} entries
 */
export function mergeRepuestoEntriesToProduct(entries) {
  if (!entries.length) return null;

  const first = entries[0];
  const modelosConcat = concatenateModelos(entries.map((entry) => entry.modelo));
  const baseDescripcion = first.descripcion;
  const description = buildRepuestoDescription(baseDescripcion, modelosConcat);
  const name = buildRepuestoName({
    descripcion: baseDescripcion,
    rend: first.rend,
    modelo: modelosConcat,
  });

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modelosConcat) {
    attributes.push({ name: 'Modelo de equipo', value: modelosConcat });
  }
  const rendLabel = formatRendLabel(first.rend);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }

  const suppliers = buildRepuestoSuppliers(first.canal);

  return normalizeProductInput({
    id: repuestoProductIdFromCode(first.code),
    code: first.code,
    name,
    description,
    brand: 'Ricoh',
    category: REPUESTOS_CATEGORY,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: {
      public: first.publico,
      tecnico: first.dist,
      mayorista: first.mayo,
      // "Dist" en Excel corresponde al precio Técnico (opción 2) y se clona para Distribuidor.
      distribuidor: first.dist,
    },
    purchase_price_usd: first.canal,
    suppliers,
    attributes: normalizeAttributes(attributes),
  });
}

/**
 * @param {Array<unknown>} row
 * @param {string} carryModelo
 * @returns {{ product: ReturnType<typeof normalizeProductInput> | null; carryModelo: string }}
 */
export function mapRepuestosExcelRowToProduct(row, carryModelo = '') {
  const { entry, carryModelo: nextModelo } = mapRepuestosExcelRowToEntry(row, carryModelo);
  if (!entry) {
    return { product: null, carryModelo: nextModelo };
  }

  return {
    product: mergeRepuestoEntriesToProduct([entry]),
    carryModelo: nextModelo,
  };
}

/**
 * @param {Array<Array<unknown>>} rows
 * @returns {RepuestoRowEntry[]}
 */
export function collectRepuestoRowEntries(rows) {
  /** @type {RepuestoRowEntry[]} */
  const entries = [];
  let carryModelo = '';

  for (let index = 1; index < rows.length; index += 1) {
    const { entry, carryModelo: nextModelo } = mapRepuestosExcelRowToEntry(rows[index], carryModelo);
    carryModelo = nextModelo;
    if (entry) entries.push(entry);
  }

  return entries;
}

/**
 * @param {RepuestoRowEntry[]} entries
 */
export function groupRepuestoEntriesByCode(entries) {
  /** @type {Map<string, RepuestoRowEntry[]>} */
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
 * @param {Buffer} buffer
 */
export function parseRepuestosProductsWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  const entries = collectRepuestoRowEntries(rows);
  const byCode = groupRepuestoEntriesByCode(entries);

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];

  for (const group of byCode.values()) {
    const product = mergeRepuestoEntriesToProduct(group);
    if (product) products.push(product);
  }

  return products;
}
