import { jsPDF } from 'jspdf';

import { formatOrderTotal, mapStoreOrderStatusToBadge } from '@/lib/admin-order-status';
import type { CompanySettings } from '@/types/company-settings';
import type { StoreOrder } from '@/types/store';

const STATUS_LABELS: Record<ReturnType<typeof mapStoreOrderStatusToBadge>, string> = {
  entregado: 'Entregado',
  enviado: 'Enviado',
  procesando: 'En procesamiento',
  cancelado: 'Cancelado',
};

function customerName(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.full_name?.trim() ||
    customer?.company_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export async function downloadSaleOrderPdf(
  order: StoreOrder,
  company: Pick<CompanySettings, 'legalName' | 'companyName' | 'ruc'>,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(185, 28, 28);
  doc.text(company.companyName || 'Haitech', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Comprobante de venta · ${order.order_number}`, margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);

  const meta = [
    `Cliente: ${customerName(order)}`,
    `Fecha: ${formatDate(order.created_at)}`,
    `Estado: ${STATUS_LABELS[mapStoreOrderStatusToBadge(order.status)] ?? order.status}`,
    `Pago: ${order.payment_status}${order.payment_method ? ` · ${order.payment_method}` : ''}`,
    `Total: ${formatOrderTotal(Number(order.total_usd), order.total_pen, order.currency)}`,
    `Emisor: ${company.legalName} · RUC ${company.ruc}`,
  ];

  for (const line of meta) {
    doc.text(line, margin, y);
    y += 5;
  }

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');

  const items = order.items ?? [];
  if (items.length === 0) {
    doc.text('Sin ítems registrados.', margin, y);
  } else {
    for (const line of items) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      const name =
        (typeof line.product_snapshot?.name === 'string' && line.product_snapshot.name) ||
        'Producto';
      const qty = line.quantity;
      const unit = Number(line.unit_price_usd).toFixed(2);
      const total = Number(line.line_total_usd).toFixed(2);
      doc.text(`${qty}× ${name}`, margin, y);
      y += 4;
      doc.text(`   USD ${unit} c/u  ·  línea $${total}`, margin, y);
      y += 6;
    }
  }

  const filename = `venta-${order.order_number.replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
