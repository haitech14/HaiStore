import XLSX from 'xlsx';

import {
  appendHaiPrintProductSuffix,
  CATEGORY_COMPATIBLE_TONER,
} from '../../shared/compatible-toner.js';
import {
  deriveCompatibleTonerNumericCode,
} from '../../shared/compatible-toner-product-code.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { roundSalePriceToNinety } from './toner-products-excel.js';

export { CATEGORY_COMPATIBLE_TONER } from '../../shared/compatible-toner.js';
export const SUPPLIER_MICAMERB = 'MICAMERB';

const CARTUCHO_PREFIX = 'Toner Cartucho Compatible RICOH';
const RECARGA_PREFIX = 'Toner Recarga compatible RICOH';

const SKIP_PATTERNS = [
  /^ESTABILIZADOR/i,
  /^TRANSFORMADOR/i,
  /^chip de toner/i,
];

/**
 * @param {unknown} value
 */
export function parsePriceCell(value) {
  if (value === '' || value == null) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  const text = String(value).trim();
  if (!text) return 0;
  const match = text.replace(/,/g, '.').match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const num = Number(match[1]);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * @param {Array<unknown>} row
 */
function extractPriceTriple(row) {
  const compra567 = parsePriceCell(row[5]);
  const tecnico567 = parsePriceCell(row[6]);
  const publico567 = parsePriceCell(row[7]);
  if (compra567 > 0 && tecnico567 > 0 && publico567 > 0) {
    return { compra: compra567, tecnico: tecnico567, publico: publico567 };
  }

  const nums = [];
  for (let col = 4; col <= 7; col += 1) {
    const price = parsePriceCell(row[col]);
    if (price > 0) nums.push(price);
  }
  if (nums.length >= 3) {
    const slice = nums.slice(-3);
    return { compra: slice[0], tecnico: slice[1], publico: slice[2] };
  }
  if (nums.length === 2) {
    return { compra: 0, tecnico: nums[0], publico: nums[1] };
  }
  if (nums.length === 1) {
    return { compra: 0, tecnico: 0, publico: nums[0] };
  }
  return { compra: 0, tecnico: 0, publico: 0 };
}

/**
 * @param {string} tone
 */
function normalizeTone(tone) {
  const upper = String(tone ?? '').trim().toUpperCase();
  if (upper === 'BK' || upper === 'B/N' || upper === 'NEGRO') return 'BK';
  if (upper === 'COLOR' || upper === 'C') return 'Color';
  return '';
}

/**
 * @param {{ modelo: string; marca: string; tone: string }}
 */
export function buildCartuchoTitle({ modelo, marca, tone }) {
  const parts = [CARTUCHO_PREFIX, modelo.trim(), marca.trim()].filter(Boolean);
  let title = parts.join(' ');
  const normalized = normalizeTone(tone);
  if (normalized === 'BK') title = `${title} Negro`;
  if (normalized === 'Color') title = `${title} Color`;
  return title.replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} descripcion
 */
export function buildRecargaTitle(descripcion) {
  const detail = String(descripcion ?? '').trim();
  if (!detail) return RECARGA_PREFIX;
  return `${RECARGA_PREFIX} ${detail}`.replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} prefix
 * @param {string[]} parts
 */
export function compatibleTonerCodeFromParts(prefix, parts) {
  const slug = parts
    .map((part) =>
      String(part ?? '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join('-');
  return `${prefix}-${slug || 'SIN-CODIGO'}`.slice(0, 64);
}

/**
 * @param {string} code
 */
export function compatibleTonerProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `compat-${slug || 'sin-codigo'}`;
}

/**
 * @param {string} text
 */
function shouldSkipRow(text) {
  const value = String(text ?? '').trim();
  if (!value) return false;
  return SKIP_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * @param {Array<unknown>} row
 * @param {{ carryModelo: string; carryMarca: string; section: 'cartucho' | 'recarga' }} state
 */
export function mapCompatibleTonerRow(row, state) {
  const col0 = String(row[0] ?? '').trim();
  const col1 = String(row[1] ?? '').trim();
  const col2 = String(row[2] ?? '').trim();
  const col3 = String(row[3] ?? '').trim();

  if (col3.toLowerCase() === 'recargas') {
    return {
      product: null,
      state: { ...state, section: 'recarga' },
    };
  }

  if (shouldSkipRow(col1) || shouldSkipRow(col2) || shouldSkipRow(col3)) {
    return { product: null, state };
  }

  if (state.section === 'recarga') {
    const descripcion = col3 || col2 || col1;
    if (!descripcion || descripcion.toLowerCase() === 'recargas') {
      return { product: null, state };
    }
    if (shouldSkipRow(descripcion)) {
      return { product: null, state };
    }

    const { compra, tecnico, publico } = extractPriceTriple(row);
    if (tecnico <= 0 && publico <= 0) {
      return { product: null, state };
    }

    const name = buildRecargaTitle(descripcion);
    const legacySlug = compatibleTonerCodeFromParts('TR', [descripcion]);
    const id = compatibleTonerProductIdFromCode(legacySlug);
    const code = deriveCompatibleTonerNumericCode(id);

    return {
      product: buildProduct({
        code,
        id,
        name,
        tipo: 'Recarga',
        modelo: '',
        marca: '',
        tone: '',
        compra,
        tecnico,
        publico,
      }),
      state,
    };
  }

  const modeloCell = col1;
  const marcaCell = col2;
  const toneCell = col3;

  const carryModelo = modeloCell || state.carryModelo;
  const carryMarca = marcaCell || state.carryMarca;

  const nextState = {
    ...state,
    carryModelo,
    carryMarca,
  };

  if (!carryModelo && !carryMarca) {
    return { product: null, state: nextState };
  }

  const { compra, tecnico, publico } = extractPriceTriple(row);
  if (tecnico <= 0 && publico <= 0) {
    return { product: null, state: nextState };
  }

  const tone = normalizeTone(toneCell);
  const name = buildCartuchoTitle({
    modelo: carryModelo,
    marca: carryMarca,
    tone: toneCell,
  });
  const legacySlug = compatibleTonerCodeFromParts('TC', [
    carryModelo,
    carryMarca,
    tone === 'BK' ? 'BK' : tone === 'Color' ? 'COLOR' : '',
  ]);
  const id = compatibleTonerProductIdFromCode(legacySlug);
  const code = deriveCompatibleTonerNumericCode(id);

  return {
    product: buildProduct({
      code,
      id,
      name,
      tipo: 'Cartucho',
      modelo: carryModelo,
      marca: carryMarca,
      tone,
      compra,
      tecnico,
      publico,
    }),
    state: nextState,
  };
}

/**
 * @param {{
 *   code: string;
 *   name: string;
 *   tipo: string;
 *   modelo: string;
 *   marca: string;
 *   tone: string;
 *   compra: number;
 *   tecnico: number;
 *   publico: number;
 * }}
 */
function buildProduct({ code, id, name, tipo, modelo, marca, tone, compra, tecnico, publico }) {
  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [{ name: 'Tipo', value: tipo }];
  if (modelo) attributes.push({ name: 'Modelo de equipo', value: modelo });
  if (marca) attributes.push({ name: 'Marca compatible', value: marca });
  if (tone) attributes.push({ name: 'Color', value: tone === 'BK' ? 'Negro' : tone });

  const tecnicoPrice = roundSalePriceToNinety(tecnico);
  const publicPrice = roundSalePriceToNinety(publico);

  /** @type {Array<{ name: string; purchase_price_usd: number }>} */
  const suppliers = [];
  if (compra > 0) {
    suppliers.push({ name: SUPPLIER_MICAMERB, purchase_price_usd: compra });
  }

  const displayName = appendHaiPrintProductSuffix(name);

  return normalizeProductInput({
    id: id ?? compatibleTonerProductIdFromCode(code),
    code,
    name: displayName,
    description: displayName,
    brand: null,
    category: CATEGORY_COMPATIBLE_TONER,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: {
      public: publicPrice,
      tecnico: tecnicoPrice > 0 ? tecnicoPrice : publicPrice,
      distribuidor: tecnicoPrice,
      mayorista: tecnicoPrice > 0 ? tecnicoPrice : publicPrice,
    },
    purchase_price_usd: compra > 0 ? compra : 0,
    attributes: normalizeAttributes(attributes),
    suppliers,
  });
}

/**
 * @param {Buffer} buffer
 */
export function parseCompatibleTonerWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  /** @type {{ carryModelo: string; carryMarca: string; section: 'cartucho' | 'recarga' }} */
  let state = { carryModelo: '', carryMarca: '', section: 'cartucho' };

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!Array.isArray(row)) continue;

    const { product, state: nextState } = mapCompatibleTonerRow(row, state);
    state = nextState;
    if (product) products.push(product);
  }

  return products;
}
