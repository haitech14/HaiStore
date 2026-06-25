import XLSX from 'xlsx';

import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { normalizeTonerCartridgeProductLabel, normalizeTonerColorProductName } from '../../shared/inventory-product-name.js';
import { formatRendLabel } from './repuestos-products-excel.js';

export const CATEGORY_ORIGINAL = 'Toner Original';
export const CATEGORY_TONER = 'Toner Original';
export const CATEGORY_SUMINISTROS = 'Suministros';
export const SUPPLIER_RICOH_PERU = 'Proveedor Ricoh del Peru';
export const SUPPLIER_RICOH_PERU_2 = 'Proveedor Ricoh del Peru 2';
export const SUPPLIER_CORP_ROSS = 'Corporacion Ross';
export const OFERTA_DEFAULT_NOTE =
  'Precio especial solo aplica a compras mayores de 6 unidades';

/**
 * @param {string} description
 * @returns {'Suministros' | 'Toner Original'}
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
  return slug || 'sin-codigo';
}

/**
 * @param {unknown} rend
 * @returns {string} Texto interior del paréntesis de rendimiento, p. ej. «6,900 páginas al 5%».
 */
function formatRendPagesSuffix(rend) {
  const rendLabel = formatRendLabel(rend);
  return rendLabel ? `${rendLabel} páginas al 5%` : '';
}

/**
 * Título del producto: descripción + modelo + color + (rendimiento).
 * @param {{ descripcion: string; rend: unknown; modelo?: string }}
 */
export function buildTonerProductTitle({ descripcion, rend, modelo = '' }) {
  const base = normalizeTonerCartridgeProductLabel(descripcion.trim());
  const parts = [base];
  const modeloSuffix = String(modelo ?? '').trim().replace(/\s{2,}/g, ' ');
  if (modeloSuffix) {
    parts.push(modeloSuffix);
  }

  let title = normalizeTonerColorProductName(parts.join(' '));
  const rendSuffix = formatRendPagesSuffix(rend);
  if (rendSuffix) {
    title = `${title} (${rendSuffix})`;
  }

  return title;
}

/**
 * Descripción larga: descripción + modelo de equipo + rendimiento.
 * @param {{ descripcion: string; rend: unknown; modelo: string }}
 */
export function buildTonerProductDescription({ descripcion, rend, modelo }) {
  const base = normalizeTonerColorProductName(
    normalizeTonerCartridgeProductLabel(descripcion.trim()),
  );
  const rendLabel = formatRendLabel(rend);
  const modelSuffix = modelo.trim();

  let description = base;
  if (modelSuffix) {
    description = `${description} — ${modelSuffix}`;
  }
  if (rendLabel && !description.includes(`Rend ${rendLabel}`)) {
    description = `${description} (Rend ${rendLabel})`;
  }

  return description;
}

/**
 * @deprecated Usar buildTonerProductTitle.
 * @param {{ descripcion: string; rend: unknown; modelo: string }}
 */
export function buildTonerProductName({ descripcion, rend, modelo }) {
  return buildTonerProductTitle({ descripcion, rend, modelo });
}

/**
 * @param {unknown[]} headerRow
 */
function resolveTonerSheetLayout(headerRow) {
  const headers = headerRow.map((cell) => String(cell ?? '').trim().toLowerCase());
  const publicoIndices = headers
    .map((header, index) => (header === 'publico' || header.startsWith('publico') ? index : -1))
    .filter((index) => index >= 0);
  const indexOf = (...needles) => {
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (needles.some((needle) => header === needle || header.includes(needle))) {
        return index;
      }
    }
    return -1;
  };

  const cajaIndex = indexOf('caja');
  const isV3 = cajaIndex >= 0;

  if (isV3) {
    const distIndex = indexOf('dist');
    const mayoristaColIndex = indexOf('mayorista');
    return {
      isV3: true,
      modelo: 0,
      code: 1,
      rend: 2,
      descripcion: 3,
      publico: publicoIndices[0] ?? 4,
      tecnico: distIndex >= 0 ? distIndex : 6,
      // "Dist" en Excel corresponde al precio Técnico (opción 2) y se clona para Distribuidor.
      distribuidor: distIndex >= 0 ? distIndex : 8,
      caja: cajaIndex,
      mayorista: cajaIndex,
      canal: indexOf('canal') >= 0 ? indexOf('canal') : 9,
      oferta: indexOf('oferta') >= 0 ? indexOf('oferta') : 10,
      ofertaNote: indexOf('oferta') >= 0 ? indexOf('oferta') + 1 : 11,
    };
  }

  return {
    isV3: false,
    modelo: 0,
    code: 1,
    rend: 2,
    descripcion: 3,
    publico: 4,
    tecnico: 5,
    distribuidor: 5,
    caja: -1,
    mayorista: 6,
    canal: 7,
    oferta: 8,
    ofertaNote: -1,
  };
}

/**
 * @param {unknown[]} row
 * @param {ReturnType<typeof resolveTonerSheetLayout>} layout
 */
function readCell(row, index) {
  if (index < 0) return '';
  return row[index];
}

/**
 * @param {number} cajaPerUnit
 */
function formatCajaAttribute(cajaPerUnit) {
  const unit = roundSalePriceToNinety(cajaPerUnit);
  if (unit <= 0) return '';
  const boxTotal = Math.round(unit * 4 * 100) / 100;
  return `USD ${unit.toFixed(2)}/u · caja 4 u. (USD ${boxTotal.toFixed(2)})`;
}

/**
 * @param {number} canal
 * @param {number} oferta
 * @param {string} ofertaNote
 */
function buildTonerSuppliers(canal, oferta, ofertaNote = '', { includeRoss = false } = {}) {
  /** @type {Array<{ name: string; purchase_price_usd: number }>} */
  const suppliers = [];
  const canalPrice = parseNumber(canal);
  const ofertaPrice = parseNumber(oferta);

  if (canalPrice > 0) {
    suppliers.push({ name: SUPPLIER_RICOH_PERU, purchase_price_usd: canalPrice });
    if (includeRoss) {
      suppliers.push({
        name: SUPPLIER_CORP_ROSS,
        purchase_price_usd: Math.round(canalPrice * 1.1 * 100) / 100,
      });
    }
  }
  if (ofertaPrice > 0) {
    suppliers.push({
      name: includeRoss ? SUPPLIER_RICOH_PERU : SUPPLIER_RICOH_PERU_2,
      purchase_price_usd: ofertaPrice,
    });
  }

  return {
    suppliers,
    ofertaNote:
      ofertaPrice > 0
        ? ofertaNote.trim() || OFERTA_DEFAULT_NOTE
        : '',
  };
}

/**
 * @param {Array<unknown>} row
 * @param {string} carryModelo
 * @param {ReturnType<typeof resolveTonerSheetLayout>} [layout]
 * @returns {{ product: ReturnType<typeof normalizeProductInput> | null; carryModelo: string }}
 */
export function mapTonerExcelRowToProduct(row, carryModelo = '', layout = resolveTonerSheetLayout([])) {
  const modeloCell = String(readCell(row, layout.modelo) ?? '').trim();
  const carryModeloNext = modeloCell || carryModelo;

  const code = String(readCell(row, layout.code) ?? '').trim();
  const rend = readCell(row, layout.rend);
  const rendValue = rend !== '' && rend != null ? rend : '';
  const description = String(readCell(row, layout.descripcion) ?? '').trim();
  const publicoRaw = parseNumber(readCell(row, layout.publico));
  const tecnicoRaw = parseNumber(readCell(row, layout.tecnico));
  const distribuidorRaw = parseNumber(readCell(row, layout.distribuidor));
  const cajaRaw = parseNumber(readCell(row, layout.caja));
  const mayoristaRaw = parseNumber(readCell(row, layout.mayorista));
  const canal = parseNumber(readCell(row, layout.canal));
  const oferta = parseNumber(readCell(row, layout.oferta));
  const ofertaNote = String(readCell(row, layout.ofertaNote) ?? '').trim();

  if (!code || !description) {
    return { product: null, carryModelo: carryModeloNext };
  }

  const classifiedCategory = classifyTonerInventoryCategory(description);
  const category = layout.isV3 ? CATEGORY_TONER : classifiedCategory;
  const upper = description.toUpperCase();
  const isCartridgeOriginal =
    (/PRINT\s*CARTRIDGE|PRINT\s*CART|\bTONER\b|CARTRIDGE/i.test(description) &&
      !upper.includes('->')) ||
    /^RICOH\b/i.test(description);
  const isOriginal = category === CATEGORY_SUMINISTROS || isCartridgeOriginal;
  const modeloForProduct =
    classifiedCategory === CATEGORY_SUMINISTROS && !layout.isV3 ? modeloCell : carryModeloNext;

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modeloForProduct) {
    attributes.push({ name: 'Modelo de equipo', value: modeloForProduct });
  }
  const rendLabel = formatRendLabel(rendValue);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }
  if (!layout.isV3) {
    const cajaLabel = formatCajaAttribute(cajaRaw);
    if (cajaLabel) {
      attributes.push({ name: 'Precio caja (4 u.)', value: cajaLabel });
    }
  }

  const { suppliers, ofertaNote: resolvedOfertaNote } = buildTonerSuppliers(
    canal,
    oferta,
    ofertaNote,
    { includeRoss: layout.isV3 },
  );
  if (resolvedOfertaNote) {
    attributes.push({ name: 'Nota oferta', value: resolvedOfertaNote });
  }

  const tecnicoRounded = layout.isV3
    ? roundSalePriceToNinety(tecnicoRaw)
    : roundSalePriceToNinety(tecnicoRaw > 0 ? tecnicoRaw : distribuidorRaw);
  const distribuidorRounded = layout.isV3
    ? tecnicoRounded
    : roundSalePriceToNinety(distribuidorRaw);
  const prices = {
    public: roundSalePriceToNinety(publicoRaw),
    tecnico: tecnicoRounded,
    distribuidor: distribuidorRounded,
    mayorista: roundSalePriceToNinety(mayoristaRaw),
  };

  const name = buildTonerProductTitle({
    descripcion: description,
    rend: rendValue,
    modelo: modeloForProduct,
  });
  const productDescription = buildTonerProductDescription({
    descripcion: description,
    rend: rendValue,
    modelo: modeloForProduct,
  });

  return {
    product: normalizeProductInput({
      id: tonerProductIdFromCode(code),
      code,
      name,
      description: productDescription,
      brand: isOriginal ? 'Ricoh' : null,
      category,
      currency: 'USD',
      stock: 0,
      image_url: null,
      gallery: [],
      prices,
      purchase_price_usd: canal > 0 ? canal : 0,
      attributes: normalizeAttributes(attributes),
      suppliers,
    }),
    carryModelo:
      classifiedCategory === CATEGORY_SUMINISTROS && !layout.isV3 ? '' : carryModeloNext,
  };
}

/**
 * Propaga el valor de MODELO DE EQUIPO en celdas combinadas de la columna A.
 * @param {import('xlsx').WorkSheet} sheet
 * @param {unknown[][]} rows
 */
function fillMergedModeloCells(sheet, rows) {
  const merges = sheet['!merges'] ?? [];
  for (const merge of merges) {
    if (merge.s.c !== 0 || merge.e.c !== 0) continue;

    const topValue = String(rows[merge.s.r]?.[0] ?? '').trim();
    if (!topValue) continue;

    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row) continue;
      if (!String(row[0] ?? '').trim()) {
        row[0] = topValue;
      }
    }
  }
}

/**
 * @param {Buffer} buffer
 */
export function parseTonerProductsWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });
  fillMergedModeloCells(sheet, rows);

  const layout = resolveTonerSheetLayout(rows[0] ?? []);

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  let carryModelo = '';

  for (let index = 1; index < rows.length; index += 1) {
    const { product, carryModelo: nextModelo } = mapTonerExcelRowToProduct(
      rows[index],
      carryModelo,
      layout,
    );
    carryModelo = nextModelo;
    if (product) products.push(product);
  }

  return products;
}
