import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const HAISALES_PROJECT_ROOT = join(__dirname, '..', '..');
export const HAISALES_SEEDS_DIR = join(HAISALES_PROJECT_ROOT, 'data', 'seeds');
export const HAISALES_VENTAS_SEEDS_DIR = join(HAISALES_SEEDS_DIR, 'ventas');

export function isHaiSalesWebhookConfigured() {
  return Boolean(process.env.HAISALES_WEBHOOK_SECRET?.trim());
}

export function verifyHaiSalesWebhookSecret(header) {
  const expected = process.env.HAISALES_WEBHOOK_SECRET?.trim();
  if (!expected) return false;
  return typeof header === 'string' && header === expected;
}

export function listPersonaSeedFiles() {
  if (!existsSync(HAISALES_SEEDS_DIR)) return [];
  return readdirSync(HAISALES_SEEDS_DIR)
    .filter((name) => /^Reporte_Persona_.*\.xlsx$/i.test(name))
    .sort();
}

export function listVentasSeedFiles() {
  if (!existsSync(HAISALES_VENTAS_SEEDS_DIR)) return [];
  return readdirSync(HAISALES_VENTAS_SEEDS_DIR)
    .filter((name) => name.toLowerCase().endsWith('.xlsx'))
    .sort();
}
