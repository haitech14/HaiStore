import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import { amountToWordsEs } from '@/lib/amount-to-words-es';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

export interface StoreOrderPdfLine {
  name: string;
  sku: string;
  quantity: number;
  unitPricePen: number;
  imageUrl?: string | null;
}

export interface StoreOrderPdfInput {
  orderNumber: string;
  issueDate?: Date;
  client: {
    razonSocial: string;
    ruc: string;
    atencion: string;
    celular: string;
    direccion: string;
    ciudad: string;
    email?: string;
  };
  lines: StoreOrderPdfLine[];
  totalPen: number;
  paymentMethod: string;
  paymentStatusLabel: string;
  orderStatusLabel: string;
  trackingMessage: string;
}

export interface GeneratedStoreOrderPdf {
  blob: Blob;
  filename: string;
  orderNumber: string;
  trackingUrl: string;
}

type Rgb = [number, number, number];
type LoadedImage = { dataUrl: string; width: number; height: number };

const PAGE_W = 210;
const MARGIN = 12;
const PRIMARY: Rgb = [220, 38, 38];
const LOGO_FALLBACK = '/logo.png';

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

function tintRgb([r, g, b]: Rgb, factor: number): Rgb {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ];
}

function normalizeCompany(company: CompanySettings): CompanySettings {
  return { ...DEFAULT_COMPANY_SETTINGS, ...company };
}

async function loadLogo(company: CompanySettings): Promise<LoadedImage | null> {
  const src = company.logoUrl?.trim() || LOGO_FALLBACK;
  try {
    const response = await fetch(src.startsWith('/') ? encodeURI(src) : src);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('logo read failed'));
      reader.readAsDataURL(blob);
    });
    const image = await createImageBitmap(blob);
    return { dataUrl, width: image.width, height: image.height };
  } catch {
    return null;
  }
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
  image: LoadedImage,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const size = fitImage(image.width, image.height, maxWidth, maxHeight);
  doc.addImage(
    image.dataUrl,
    image.dataUrl.includes('jpeg') || image.dataUrl.includes('jpg') ? 'JPEG' : 'PNG',
    x + (maxWidth - size.width) / 2,
    y + (maxHeight - size.height) / 2,
    size.width,
    size.height,
  );
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
): number {
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

export function buildOrderTrackingUrl(orderNumber: string): string {
  return buildAbsoluteUrl(
    `/mi-cuenta?tab=pedidos&orden=${encodeURIComponent(orderNumber)}`,
  );
}

export async function buildStoreOrderPdf(
  input: StoreOrderPdfInput,
  companyInput: CompanySettings = DEFAULT_COMPANY_SETTINGS,
): Promise<GeneratedStoreOrderPdf> {
  const company = normalizeCompany(companyInput);
  const issueDate = input.issueDate ?? new Date();
  const trackingUrl = buildOrderTrackingUrl(input.orderNumber);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const primarySoft = tintRgb(PRIMARY, 0.88);
  const primaryLight = tintRgb(PRIMARY, 0.94);
  const contentW = PAGE_W - MARGIN * 2;
  const logo = await loadLogo(company);

  let y = MARGIN;

  if (logo) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, y, 38, 24, 2, 2, 'FD');
    addFittedImage(doc, logo, MARGIN + 2, y + 2, 34, 20);
  }

  const centerX = MARGIN + 42;
  const centerW = 98;
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company.companyName, centerX + centerW / 2, y + 7, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text(company.legalName, centerX + centerW / 2, y + 12.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const addressLine = `${company.address}${company.city ? ` — ${company.city}` : ''}`;
  doc.text(doc.splitTextToSize(addressLine, centerW), centerX + centerW / 2, y + 17, {
    align: 'center',
  });

  const badgeW = 48;
  const badgeX = PAGE_W - MARGIN - badgeW;
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(badgeX, y, badgeW, 24, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ORDEN DE', badgeX + badgeW / 2, y + 7, { align: 'center' });
  doc.text('PEDIDO', badgeX + badgeW / 2, y + 12, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC ${company.ruc}`, badgeX + badgeW / 2, y + 16.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(input.orderNumber, badgeX + badgeW / 2, y + 21, { align: 'center' });

  y += 30;

  doc.setFillColor(...primaryLight);
  doc.setDrawColor(...primarySoft);
  doc.roundedRect(MARGIN, y, contentW, 14, 2, 2, 'FD');
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('¡Felicitaciones!', MARGIN + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const congrats = doc.splitTextToSize(
    'Su pedido ha sido registrado correctamente en nuestro sistema. Conserve este documento como comprobante y utilice el código de seguimiento para consultar el estado en línea.',
    contentW - 8,
  );
  doc.text(congrats, MARGIN + 4, y + 11);
  y += 18;

  const boxGap = 4;
  const boxW = (contentW - boxGap) / 2;
  const boxH = 40;
  const leftX = MARGIN;
  const rightX = MARGIN + boxW + boxGap;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, boxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, boxH, 2, 2, 'FD');

  drawSectionTitle(doc, leftX, y, boxW, 'DATOS DEL CLIENTE', PRIMARY);
  drawSectionTitle(doc, rightX, y, boxW, 'DETALLE DEL PEDIDO', PRIMARY);

  let rowY = y + 11;
  const clientRows: [string, string][] = [
    ['CLIENTE:', input.client.razonSocial],
    ['RUC/DNI:', input.client.ruc],
    ['DIRECCIÓN:', input.client.direccion],
    ['CIUDAD:', input.client.ciudad],
    ['ATENCIÓN:', input.client.atencion],
    ['CELULAR:', input.client.celular],
  ];
  if (input.client.email?.trim()) {
    clientRows.push(['CORREO:', input.client.email.trim()]);
  }

  clientRows.forEach(([label, value]) => {
    const lines = drawLabelValue(doc, label, value, leftX + 3, rowY, 18, boxW - 6);
    rowY += Math.max(lines, 1) * 3.6 + 0.8;
  });

  rowY = y + 11;
  const detailRows: [string, string][] = [
    ['FECHA:', formatShortDate(issueDate)],
    ['CÓDIGO:', input.orderNumber],
    ['ESTADO:', input.orderStatusLabel],
    ['PAGO:', input.paymentStatusLabel],
    ['MÉTODO:', input.paymentMethod],
    ['SEGUIMIENTO:', input.trackingMessage],
  ];
  detailRows.forEach(([label, value]) => {
    const lines = drawLabelValue(doc, label, value, rightX + 3, rowY, 22, boxW - 6);
    rowY += Math.max(lines, 1) * 3.6 + 0.8;
  });

  y += boxH + 5;

  const tableX = MARGIN;
  const tableW = contentW;
  const col = { n: 8, code: 24, desc: 78, qty: 14, unit: 28, amount: 28 };
  const headerH = 8;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(tableX, y, tableW, headerH, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);

  let cx = tableX + 2;
  doc.text('N°', cx + 2, y + 5.2);
  cx += col.n;
  doc.text('CÓDIGO', cx + 1, y + 5.2);
  cx += col.code;
  doc.text('DESCRIPCIÓN', cx + 1, y + 5.2);
  cx += col.desc;
  doc.text('CANT.', cx + 2, y + 5.2);
  cx += col.qty;
  doc.text('P/U', cx + 4, y + 5.2);
  cx += col.unit;
  doc.text('IMPORTE', cx + 2, y + 5.2);

  y += headerH;
  const rowH = 14;

  input.lines.forEach((line, index) => {
    const quantity = line.quantity;
    const lineTotal = line.unitPricePen * quantity;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, y, tableW, rowH, 'FD');

    cx = tableX + 2;
    doc.setTextColor(23, 23, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(String(index + 1), cx + 3, y + 8);
    cx += col.n;

    doc.setFontSize(7);
    doc.text(line.sku || '—', cx + 1, y + 8);
    cx += col.code;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const desc = doc.splitTextToSize(line.name, col.desc - 2);
    doc.text(desc, cx + 1, y + 7);
    cx += col.desc;

    doc.setFont('helvetica', 'bold');
    doc.text(String(quantity), cx + 4, y + 8);
    cx += col.qty;
    doc.text(formatPen(line.unitPricePen), cx + 1, y + 8);
    cx += col.unit;
    doc.text(formatPen(lineTotal), cx + 1, y + 8);

    y += rowH;
  });

  y += 4;

  const totalsW = 62;
  const totalsX = PAGE_W - MARGIN - totalsW;
  const gravada = Math.round((input.totalPen / 1.18) * 100) / 100;
  const igv = Math.round((input.totalPen - gravada) * 100) / 100;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('GRAVADA:', totalsX, y + 4);
  doc.text(formatPen(gravada), totalsX + totalsW, y + 4, { align: 'right' });
  y += 6.5;
  doc.text('IGV 18.00 %:', totalsX, y + 4);
  doc.text(formatPen(igv), totalsX + totalsW, y + 4, { align: 'right' });
  y += 7.5;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(totalsX - 2, y, totalsW + 2, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', totalsX, y + 5.5);
  doc.text(formatPen(input.totalPen), totalsX + totalsW, y + 5.5, { align: 'right' });
  y += 12;

  doc.setFillColor(...primaryLight);
  doc.setDrawColor(...primarySoft);
  doc.roundedRect(MARGIN, y, contentW, 10, 2, 2, 'FD');
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`IMPORTE EN LETRAS: ${amountToWordsEs(input.totalPen, 'SOLES')}`, MARGIN + 4, y + 6.5);
  y += 14;

  const footerBoxH = 36;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN, y, contentW, footerBoxH, 2, 2, 'FD');
  drawSectionTitle(doc, MARGIN, y, contentW, 'INFORMACIÓN DE SEGUIMIENTO', PRIMARY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const trackingLines = [
    `Código de seguimiento: ${input.orderNumber}`,
    'Escanee el código QR para ver el estado de su pedido en HaiStore.',
    input.trackingMessage,
    `Portal: ${trackingUrl}`,
  ];
  let trackY = y + 11;
  trackingLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, contentW - 8);
    doc.text(wrapped, MARGIN + 4, trackY);
    trackY += wrapped.length * 3.5 + 1;
  });

  const barH = 16;
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 281 - barH, PAGE_W, barH + (297 - 281), 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const footerText = `Orden de pedido ${input.orderNumber}. ${company.quoteFooterText} ${company.supportUrl}`;
  doc.text(doc.splitTextToSize(footerText, PAGE_W - MARGIN * 2 - 34), MARGIN, 281 - barH + 5);

  try {
    const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      margin: 0,
      width: 180,
      color: { dark: '#ffffff', light: '#00000000' },
    });
    doc.addImage(qrDataUrl, 'PNG', PAGE_W - MARGIN - 30, 281 - barH + 1, 28, 28);
  } catch {
    // QR opcional
  }

  const safeName = input.client.razonSocial.replace(/[^\w\s-]/g, '').trim().slice(0, 24);
  const filename = `orden-${input.orderNumber.replace(/\s+/g, '-')}-${safeName || 'cliente'}.pdf`.toLowerCase();

  return {
    blob: doc.output('blob'),
    filename,
    orderNumber: input.orderNumber,
    trackingUrl,
  };
}

export function downloadStoreOrderPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
