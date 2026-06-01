import type { ShipmentRecord } from '@/types/shipping';

export interface ShipmentLabelContext {
  carrierName: string;
  zoneName: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printShipmentLabel(shipment: ShipmentRecord, context: ShipmentLabelContext): void {
  const created = new Date(shipment.createdAt).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Rótulo ${escapeHtml(shipment.orderRef)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; padding: 12mm; color: #111; }
    .label { border: 2px solid #111; border-radius: 8px; padding: 10mm; max-width: 100mm; }
    .brand { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #b91c1c; }
    h1 { font-size: 20px; margin: 4px 0 8px; }
    .tracking { font-size: 16px; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 10px; }
    .block { margin-bottom: 8px; font-size: 13px; line-height: 1.4; }
    .block strong { display: block; font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px; }
    .footer { margin-top: 12px; padding-top: 8px; border-top: 1 dashed #ccc; font-size: 10px; color: #666; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="label">
    <p class="brand">Haitech — Envío</p>
    <h1>${escapeHtml(shipment.orderRef)}</h1>
    <p class="tracking">${escapeHtml(shipment.trackingCode)}</p>
    <div class="block">
      <strong>Destinatario</strong>
      ${escapeHtml(shipment.customerName)}
    </div>
    <div class="block">
      <strong>Destino</strong>
      ${escapeHtml(shipment.district)} · ${escapeHtml(context.zoneName)}
    </div>
    <div class="block">
      <strong>Courier</strong>
      ${escapeHtml(context.carrierName)}
    </div>
    ${shipment.customerPhone?.trim() ? `<div class="block"><strong>Teléfono</strong>${escapeHtml(shipment.customerPhone.trim())}</div>` : ''}
    <p class="footer">Fecha: ${escapeHtml(created)} · ETA: ${escapeHtml(shipment.etaLabel)}</p>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const popup = window.open('', '_blank', 'noopener,noreferrer,width=480,height=640');
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
