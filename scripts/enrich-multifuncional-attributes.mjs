/**
 * Añade Formato papel y Producción a multifuncionales; mantiene Color y ADF.
 * Ejecutar: node scripts/enrich-multifuncional-attributes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inventoryPath = path.join(__dirname, '..', 'server', 'data', 'inventory.json');

const FORMATO_PAPEL_ATTR = 'Formato papel';
const PRODUCCION_ATTR = 'Producción';
const ADF_ATTR = 'Alimentador (ADF)';

function normalizeAdfValue(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || /no tiene/i.test(trimmed)) return null;
  if (/doble\s*scan/i.test(trimmed)) return 'Doble Scan';
  if (/estandar|estándar/i.test(trimmed)) return 'Estándar';
  return null;
}

function inferAdf(product) {
  const haystack = product.name.toLowerCase();
  const stored = (product.attributes ?? []).find(
    (attr) => attr.name?.trim() === ADF_ATTR || /alimentador.*adf/i.test(attr.name ?? ''),
  );
  if (stored) return normalizeAdfValue(stored.value);
  if (/\blaser\b/.test(haystack) && !/multifunc/i.test(product.category ?? '')) return null;
  if (/\bim\s*430f\b|\bim\s*460f\b/.test(haystack)) return 'Doble Scan';
  if (/multifunc/i.test(product.category ?? '')) return 'Estándar';
  return null;
}

function inferFormatoPapel(product) {
  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  if (
    /\b(pro\s+c9500|pro\s+c7500|im\s*9000|im\s*8000|im\s*c8000|pro\s+84)\b/.test(haystack) ||
    haystack.includes('planos') ||
    haystack.includes('formato ancho')
  ) {
    return 'A3';
  }
  return 'A4';
}

function inferProduccionTier(product) {
  const haystack = product.name.toUpperCase();
  if (
    /\bPRO\s+C9500\b/.test(haystack) ||
    /\bPRO\s+C7500\b/.test(haystack) ||
    /\bIM\s*9000\b/.test(haystack) ||
    /\bIM\s*8000\b/.test(haystack) ||
    /\bIM\s*C8000\b/.test(haystack) ||
    /\bPRO\s+84/.test(haystack) ||
    haystack.includes('PLANOS')
  ) {
    return 'Producción (200,000 a 500,000 páginas aprox)';
  }
  if (
    /\bIM\s*7000\b/.test(haystack) ||
    /\bIM\s*6000\b/.test(haystack) ||
    /\bIM\s*5000\b/.test(haystack) ||
    /\bIM\s*4000\b/.test(haystack) ||
    /\bIM\s*C6010\b/.test(haystack) ||
    /\bIM\s*C6500\b/.test(haystack) ||
    /\bPRO\s+C54/.test(haystack) ||
    /\bMP\s*7503\b/.test(haystack) ||
    /\bIM\s*600F\b/.test(haystack)
  ) {
    return 'Alta Producción (50,000 páginas aprox)';
  }
  if (
    /\bIM\s*550/.test(haystack) ||
    /\bIM\s*3000\b/.test(haystack) ||
    /\bIM\s*2500\b/.test(haystack) ||
    /\bMP\s*4054\b/.test(haystack) ||
    /\bMP\s*5055\b/.test(haystack) ||
    /\bIM\s*C3010\b/.test(haystack) ||
    /\bIM\s*C4510\b/.test(haystack) ||
    /\bPRO\s+C52/.test(haystack)
  ) {
    return 'Mediano (15,000 páginas aprox)';
  }
  return 'Basico (>5000 páginas)';
}

function upsertAttribute(attributes, name, value) {
  const list = Array.isArray(attributes) ? [...attributes] : [];
  const index = list.findIndex((row) => row?.name?.trim() === name);
  if (index >= 0) {
    list[index] = { ...list[index], name, value };
    return list;
  }
  return [...list, { id: randomUUID(), name, value }];
}

const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
let updated = 0;

for (const product of data.products) {
  if (!/multifunc/i.test(product.category ?? '')) continue;
  const formato = inferFormatoPapel(product);
  const produccion = inferProduccionTier(product);
  product.attributes = upsertAttribute(product.attributes, FORMATO_PAPEL_ATTR, formato);
  product.attributes = upsertAttribute(product.attributes, PRODUCCION_ATTR, produccion);
  const adf = inferAdf(product);
  if (adf) {
    product.attributes = upsertAttribute(product.attributes, ADF_ATTR, adf);
  } else {
    product.attributes = (product.attributes ?? []).filter(
      (row) => row?.name?.trim() !== ADF_ATTR,
    );
  }
  updated += 1;
}

fs.writeFileSync(inventoryPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Multifuncionales actualizados: ${updated}`);
