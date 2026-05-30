import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import { amountToWordsEs } from '@/lib/amount-to-words-es';
import type { CompanySettings } from '@/types/company-settings';

export interface QuoteClientData {
  razonSocial: string;
  ruc: string;
  atencion: string;
  celular: string;
  ciudad: string;
}

export interface QuoteProductData {
  name: string;
  sku: string;
  brand: string;
  pricePen: number;
  quantity?: number;
  imageUrl?: string | null;
}

export interface GeneratedQuotePdf {
  blob: Blob;
  filename: string;
  quoteNumber: string;
}

type Rgb = [number, number, number];

const PAGE_W = 210;
const MARGIN = 12;

function formatPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return [30, 64, 175];
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function tintRgb([r, g, b]: Rgb, factor: number): Rgb {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ];
}

async function loadImageDataUrl(
  src: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!src) return null;

  const loadFromDataUrl = (dataUrl: string) =>
    new Promise<{ dataUrl: string; width: number; height: number } | null>((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ dataUrl, width: image.width, height: image.height });
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });

  if (src.startsWith('data:')) return loadFromDataUrl(src);

  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return loadFromDataUrl(dataUrl);
  } catch {
    return null;
  }
}

function imageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
  return 'PNG';
}

function fitImage(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = width / height;
  let w = maxWidth;
  let h = w / ratio;
  if (h > maxHeight) {
    h = maxHeight;
    w = h * ratio;
  }
  return { width: w, height: h };
}

function addFittedImage(
  doc: jsPDF,
  image: { dataUrl: string; width: number; height: number },
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const size = fitImage(image.width, image.height, maxWidth, maxHeight);
  const offsetX = x + (maxWidth - size.width) / 2;
  const offsetY = y + (maxHeight - size.height) / 2;
  doc.addImage(image.dataUrl, imageFormat(image.dataUrl), offsetX, offsetY, size.width, size.height);
}

function drawSectionTitle(doc: jsPDF, x: number, y: number, w: number, title: string, color: Rgb) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(title, x + 3, y + 4.8);
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number,
  maxWidth: number,
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(55, 65, 81);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(23, 23, 23);
  const lines = doc.splitTextToSize(value, maxWidth - labelWidth);
  doc.text(lines, x + labelWidth, y);
  return Array.isArray(lines) ? lines.length : 1;
}

function buildQuoteNumber(company: CompanySettings): string {
  const serial = String(company.quoteNextNumber || 1).padStart(4, '0');
  return `${company.quoteNumberPrefix}-${serial}`;
}

export async function buildProductQuotePdf(
  client: QuoteClientData,
  product: QuoteProductData,
  company: CompanySettings,
): Promise<GeneratedQuotePdf> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const primary = hexToRgb(company.primaryColor);
  const primarySoft = tintRgb(primary, 0.88);
  const primaryLight = tintRgb(primary, 0.94);
  const contentW = PAGE_W - MARGIN * 2;

  const issueDate = new Date();
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(expiryDate.getDate() + company.quoteValidityDays);

  const quantity = product.quantity ?? 1;
  const lineTotal = product.pricePen * quantity;
  const gravada = Math.round((lineTotal / 1.18) * 100) / 100;
  const igv = Math.round((lineTotal - gravada) * 100) / 100;
  const total = lineTotal;

  const quoteNumber = buildQuoteNumber(company);
  const logo = company.logoUrl ? await loadImageDataUrl(company.logoUrl) : null;
  const productImage = product.imageUrl ? await loadImageDataUrl(product.imageUrl) : null;

  let y = MARGIN;

  if (logo) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, y, 38, 24, 2, 2, 'FD');
    addFittedImage(doc, logo, MARGIN + 2, y + 2, 34, 20);
  }

  const centerX = MARGIN + 42;
  const centerW = 98;
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company.companyName, centerX + centerW / 2, y + 7, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text(company.legalName, centerX + centerW / 2, y + 12.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const addressLine = `${company.address}${company.city ? ` — ${company.city}` : ''}`;
  const addressLines = doc.splitTextToSize(addressLine, centerW);
  doc.text(addressLines, centerX + centerW / 2, y + 17, { align: 'center' });
  const descLines = doc.splitTextToSize(company.businessDescription || company.tagline, centerW);
  doc.text(descLines, centerX + centerW / 2, y + 17 + addressLines.length * 3.2, { align: 'center' });

  const badgeW = 48;
  const badgeX = PAGE_W - MARGIN - badgeW;
  doc.setFillColor(...primary);
  doc.roundedRect(badgeX, y, badgeW, 24, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(company.quoteDocumentLabel, badgeX + badgeW / 2, y + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC ${company.ruc}`, badgeX + badgeW / 2, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(quoteNumber, badgeX + badgeW / 2, y + 19.5, { align: 'center' });

  y += 30;

  const boxGap = 4;
  const boxW = (contentW - boxGap) / 2;
  const boxH = 36;
  const leftX = MARGIN;
  const rightX = MARGIN + boxW + boxGap;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, boxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, boxH, 2, 2, 'FD');

  drawSectionTitle(doc, leftX, y, boxW, 'DATOS DEL CLIENTE', primary);
  drawSectionTitle(doc, rightX, y, boxW, 'DETALLE DE LA PROFORMA', primary);

  let rowY = y + 11;
  const labelW = 18;
  const valueW = boxW - 8;

  const clientRows: [string, string][] = [
    ['CLIENTE:', client.razonSocial],
    ['RUC:', client.ruc],
    ['DIRECCIÓN:', client.ciudad],
    ['ATENCIÓN:', client.atencion],
    ['CELULAR:', client.celular],
  ];

  clientRows.forEach(([label, value]) => {
    const lines = drawLabelValue(doc, label, value, leftX + 3, rowY, labelW, valueW);
    rowY += Math.max(lines, 1) * 3.8 + 1.2;
  });

  rowY = y + 11;
  const detailRows: [string, string][] = [
    ['FECHA EMISIÓN:', formatShortDate(issueDate)],
    ['FECHA DE VENC.:', formatShortDate(expiryDate)],
    ['MONEDA:', company.currencyLabel],
    ['TIPO DE CLIENTE:', company.defaultClientType],
  ];

  detailRows.forEach(([label, value]) => {
    const lines = drawLabelValue(doc, label, value, rightX + 3, rowY, 24, valueW);
    rowY += Math.max(lines, 1) * 3.8 + 1.2;
  });

  y += boxH + 5;

  const tableX = MARGIN;
  const tableW = contentW;
  const col = {
    n: 8,
    img: 16,
    code: 22,
    desc: 58,
    qty: 12,
    um: 14,
    unit: 24,
    amount: 26,
  };

  const headerH = 8;
  doc.setFillColor(...primary);
  doc.roundedRect(tableX, y, tableW, headerH, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);

  let cx = tableX + 2;
  doc.text('N°', cx + 2, y + 5.2);
  cx += col.n;
  doc.text('IMAGEN', cx + 1, y + 5.2);
  cx += col.img;
  doc.text('CÓDIGO', cx + 1, y + 5.2);
  cx += col.code;
  doc.text('DESCRIPCIÓN', cx + 1, y + 5.2);
  cx += col.desc;
  doc.text('CANT.', cx + 2, y + 5.2);
  cx += col.qty;
  doc.text('UM', cx + 2, y + 5.2);
  cx += col.um;
  doc.text('P/U', cx + 4, y + 5.2);
  cx += col.unit;
  doc.text('IMPORTE', cx + 2, y + 5.2);

  y += headerH;
  const rowH = 18;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, y, tableW, rowH, 'FD');

  cx = tableX + 2;
  doc.setTextColor(23, 23, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('1', cx + 3, y + 10);
  cx += col.n;

  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(cx + 1, y + 3, col.img - 2, rowH - 6, 1, 1, 'FD');
  if (productImage) {
    addFittedImage(doc, productImage, cx + 2, y + 4, col.img - 4, rowH - 8);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text('S/IMG', cx + 4, y + 10);
  }
  cx += col.img;

  doc.setTextColor(23, 23, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(product.sku, cx + 1, y + 8);
  cx += col.code;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const productDesc = doc.splitTextToSize(`${product.name} / ${product.brand}`, col.desc - 2);
  doc.text(productDesc, cx + 1, y + 7);
  cx += col.desc;

  doc.setFont('helvetica', 'bold');
  doc.text(String(quantity), cx + 4, y + 10);
  cx += col.qty;

  doc.setFont('helvetica', 'normal');
  doc.text('UNIDAD', cx + 1, y + 10);
  cx += col.um;

  doc.setFont('helvetica', 'bold');
  doc.text(formatPen(product.pricePen), cx + 1, y + 10);
  cx += col.unit;
  doc.text(formatPen(lineTotal), cx + 1, y + 10);

  y += rowH + 4;

  const totalsW = 62;
  const totalsX = PAGE_W - MARGIN - totalsW;
  const totalsRowH = 6.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('GRAVADA:', totalsX, y + 4);
  doc.text(formatPen(gravada), totalsX + totalsW, y + 4, { align: 'right' });
  y += totalsRowH;
  doc.text('IGV 18.00 %:', totalsX, y + 4);
  doc.text(formatPen(igv), totalsX + totalsW, y + 4, { align: 'right' });
  y += totalsRowH + 1;

  doc.setFillColor(...primary);
  doc.roundedRect(totalsX - 2, y, totalsW + 2, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', totalsX, y + 5.5);
  doc.text(formatPen(total), totalsX + totalsW, y + 5.5, { align: 'right' });
  y += 12;

  doc.setFillColor(...primaryLight);
  doc.setDrawColor(...primarySoft);
  doc.roundedRect(MARGIN, y, contentW, 10, 2, 2, 'FD');
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const amountWords = amountToWordsEs(total, 'SOLES');
  doc.text(`IMPORTE EN LETRAS: ${amountWords}`, MARGIN + 4, y + 6.5);
  y += 14;

  const footerBoxH = 42;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, footerBoxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, footerBoxH, 2, 2, 'FD');
  drawSectionTitle(doc, leftX, y, boxW, 'CUENTAS BANCARIAS', primary);
  drawSectionTitle(doc, rightX, y, boxW, 'TÉRMINOS Y CONDICIONES', primary);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const bankLines = company.bankAccountsText.split('\n').filter(Boolean);
  let bankY = y + 11;
  bankLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, boxW - 6);
    doc.text(wrapped, leftX + 3, bankY);
    bankY += wrapped.length * 3.4 + 1;
  });

  const termLines = company.quoteTermsText.split('\n').filter(Boolean);
  let termY = y + 11;
  termLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, boxW - 6);
    doc.text(wrapped, rightX + 3, termY);
    termY += wrapped.length * 3.4 + 1;
  });

  y += footerBoxH + 5;

  const barH = 16;
  doc.setFillColor(...primary);
  doc.rect(0, 281 - barH, PAGE_W, barH + (297 - 281), 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const footerText = `${company.quoteDocumentLabel} ${quoteNumber}. ${company.quoteFooterText} ${company.supportUrl}`;
  const footerLines = doc.splitTextToSize(footerText, PAGE_W - MARGIN * 2 - 34);
  doc.text(footerLines, MARGIN, 281 - barH + 5);

  try {
    const qrUrl = `${company.supportUrl}?ref=${encodeURIComponent(quoteNumber)}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 0,
      width: 256,
      color: { dark: '#ffffff', light: '#00000000' },
    });
    doc.addImage(qrDataUrl, 'PNG', PAGE_W - MARGIN - 30, 281 - barH + 1, 28, 28);
  } catch {
    // QR opcional si falla la generación.
  }

  const safeName = client.razonSocial.replace(/[^\w\s-]/g, '').trim().slice(0, 30);
  const filename = `${company.quoteNumberPrefix}-${quoteNumber.split('-').pop()}-${safeName || 'cliente'}.pdf`.toLowerCase();

  return {
    blob: doc.output('blob'),
    filename,
    quoteNumber,
  };
}

export function downloadQuotePdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
