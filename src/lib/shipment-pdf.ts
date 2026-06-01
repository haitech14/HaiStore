import { jsPDF } from 'jspdf';

import { buildAgencyDisplay, buildShipmentCopyMessage } from '@/lib/shipment-copy-message';
import { calcShipmentTotals, DEFAULT_EXCHANGE_RATE } from '@/lib/shipment-form';
import type { ShipmentRecord } from '@/types/shipping';

export interface ShipmentPdfContext {
  carrierName: string;
}

export async function downloadShipmentPdf(
  shipment: ShipmentRecord,
  context: ShipmentPdfContext,
): Promise<void> {
  const agencyDisplay = buildAgencyDisplay(context.carrierName, shipment.agencyDetail);
  const copyText = buildShipmentCopyMessage(shipment, { agencyDisplay });
  const lineItems = shipment.lineItems?.length ? shipment.lineItems : [];
  const exchangeRate = shipment.exchangeRate ?? DEFAULT_EXCHANGE_RATE;
  const { productsUsd, totalPen } = calcShipmentTotals(
    lineItems,
    exchangeRate,
    shipment.shippingCostPen,
  );

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(185, 28, 28);
  doc.text('Haitech — Resumen de envío', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Pedido: ${shipment.orderRef}  ·  Seguimiento: ${shipment.trackingCode}`, margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);

  const lines = copyText.split('\n');
  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = margin;
    }
    const wrapped = doc.splitTextToSize(line, 182);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.2 + 1.5;
  }

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total productos USD: $${productsUsd}`, margin, y);
  y += 5;
  doc.text(`Total soles (incl. envío): S/ ${totalPen}`, margin, y);

  const filename = `envio-${shipment.orderRef.replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
