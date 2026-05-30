import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, '../data/company-settings.json');

const DEFAULT_SETTINGS = {
  companyName: 'HAITECH',
  legalName: 'NBN TECNOLOGIA TOTAL S.A.C.',
  tagline: 'Soluciones de impresión y equipos de oficina',
  businessDescription:
    'Venta y alquiler de equipos de impresión, repuestos, tóner y servicio técnico especializado.',
  ruc: '20612146561',
  address: 'Av. Petit Thouars Nro. — LINCE - LIMA - LIMA',
  city: 'Lima',
  phone: '+51 1 234 5678',
  email: 'ventas@haitech.com',
  website: 'www.haitech.com',
  logoUrl: '/logo.png',
  quoteDocumentLabel: 'PROFORMA',
  quoteNumberPrefix: 'COT01',
  quoteNextNumber: 15,
  currencyLabel: 'SOLES (PEN)',
  defaultClientType: 'Corporativo',
  bankAccountsText: [
    'BCP SOLES: 194-123456789-0-12 — CCI 00219400123456789012',
    'BCP DÓLARES: 194-987654321-1-99 — CCI 00219400987654321999',
    'BBVA SOLES: 0011-0123-456789012345 — CCI 0110123001234567890123',
    'BBVA DÓLARES: 0011-0987-654321098765 — CCI 0110123098765432109876',
  ].join('\n'),
  supportUrl: 'https://soporte.haitech.pe/',
  quoteFooterText:
    'Representación impresa con fines informativos. Consulte el enlace de soporte o escanee el código QR para referencia.',
  quoteTermsText: [
    'Validez de la oferta: 3 días calendario o hasta agotar stock.',
    'Los precios pueden variar sin previo aviso por fluctuaciones del proveedor o tipo de cambio.',
    'Instalación y capacitación básica incluidas en Lima Metropolitana, salvo indicación contraria.',
    'Forma de pago: transferencia bancaria o depósito a las cuentas indicadas.',
  ].join('\n'),
  quoteValidityDays: 3,
  primaryColor: '#1e40af',
};

async function ensureSettingsFile() {
  try {
    await fs.access(SETTINGS_PATH);
  } catch {
    await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
}

function normalizeSettings(input = {}) {
  return {
    companyName: String(input.companyName ?? DEFAULT_SETTINGS.companyName).trim(),
    legalName: String(input.legalName ?? DEFAULT_SETTINGS.legalName).trim(),
    tagline: String(input.tagline ?? DEFAULT_SETTINGS.tagline).trim(),
    businessDescription: String(input.businessDescription ?? DEFAULT_SETTINGS.businessDescription).trim(),
    ruc: String(input.ruc ?? DEFAULT_SETTINGS.ruc).trim(),
    address: String(input.address ?? DEFAULT_SETTINGS.address).trim(),
    city: String(input.city ?? DEFAULT_SETTINGS.city).trim(),
    phone: String(input.phone ?? DEFAULT_SETTINGS.phone).trim(),
    email: String(input.email ?? DEFAULT_SETTINGS.email).trim(),
    website: String(input.website ?? DEFAULT_SETTINGS.website).trim(),
    logoUrl: String(input.logoUrl ?? DEFAULT_SETTINGS.logoUrl).trim(),
    quoteDocumentLabel: String(input.quoteDocumentLabel ?? DEFAULT_SETTINGS.quoteDocumentLabel).trim(),
    quoteNumberPrefix: String(input.quoteNumberPrefix ?? DEFAULT_SETTINGS.quoteNumberPrefix).trim(),
    quoteNextNumber: Math.max(1, Number(input.quoteNextNumber) || DEFAULT_SETTINGS.quoteNextNumber),
    currencyLabel: String(input.currencyLabel ?? DEFAULT_SETTINGS.currencyLabel).trim(),
    defaultClientType: String(input.defaultClientType ?? DEFAULT_SETTINGS.defaultClientType).trim(),
    bankAccountsText: String(input.bankAccountsText ?? DEFAULT_SETTINGS.bankAccountsText).trim(),
    supportUrl: String(input.supportUrl ?? DEFAULT_SETTINGS.supportUrl).trim(),
    quoteFooterText: String(input.quoteFooterText ?? DEFAULT_SETTINGS.quoteFooterText).trim(),
    quoteTermsText: String(input.quoteTermsText ?? DEFAULT_SETTINGS.quoteTermsText).trim(),
    quoteValidityDays: Math.max(1, Number(input.quoteValidityDays) || DEFAULT_SETTINGS.quoteValidityDays),
    primaryColor: String(input.primaryColor ?? DEFAULT_SETTINGS.primaryColor).trim(),
  };
}

export async function readCompanySettings() {
  await ensureSettingsFile();
  const raw = await fs.readFile(SETTINGS_PATH, 'utf-8');
  return normalizeSettings(JSON.parse(raw));
}

export async function writeCompanySettings(input) {
  const settings = normalizeSettings(input);
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  return settings;
}
