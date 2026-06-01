import { DEFAULT_EXCHANGE_RATE, calcShipmentTotals, parseLineItems } from '@/lib/shipment-form';
import type { ShipmentFormState } from '@/lib/shipment-form';
import type { ShipmentRecord } from '@/types/shipping';

export interface ShipmentCopyContext {
  /** Nombre del courier + detalle, ej. «Shalom (A Domicilio)». */
  agencyDisplay: string;
}

function formatShipmentDate(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw) {
    return new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  const parsed = raw.includes('T') ? new Date(raw) : new Date(`${raw}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function resolveLineItems(shipment: ShipmentRecord) {
  return shipment.lineItems?.length ? shipment.lineItems : [];
}

function resolveExchangeRate(shipment: ShipmentRecord): number {
  return shipment.exchangeRate && shipment.exchangeRate > 0
    ? shipment.exchangeRate
    : DEFAULT_EXCHANGE_RATE;
}

export function buildAgencyDisplay(
  carrierName: string,
  agencyDetail?: string | null,
): string {
  const detail = agencyDetail?.trim();
  if (!detail) return carrierName;
  if (carrierName.toLowerCase().includes(detail.toLowerCase())) return carrierName;
  return `${carrierName} (${detail})`;
}

/** Texto para WhatsApp / copiar (formato operativo Haitech). */
export function buildShipmentCopyMessage(
  shipment: ShipmentRecord,
  context: ShipmentCopyContext,
): string {
  const razon = shipment.razonSocial?.trim() || shipment.customerName.trim();
  const destino = shipment.destination?.trim() || shipment.district.trim();
  const lineItems = resolveLineItems(shipment);
  const exchangeRate = resolveExchangeRate(shipment);
  const { productsUsd, totalPen } = calcShipmentTotals(
    lineItems,
    exchangeRate,
    shipment.shippingCostPen,
  );

  const pedidoLines = lineItems.map(
    (line) =>
      `- ${line.description} $${line.unitPriceUsd} x${line.quantity} = $${line.unitPriceUsd * line.quantity}`,
  );

  const dniPart = shipment.customerDni?.trim()
    ? `*DNI:* ${shipment.customerDni.trim()}`
    : '*DNI:*';
  const celPart = shipment.customerPhone?.trim()
    ? ` Cel: ${shipment.customerPhone.trim()}`
    : '';

  return [
    `📅 ${formatShipmentDate(shipment.shipmentDate ?? shipment.createdAt)}`,
    '',
    '🙋‍♀️ *Datos de Envio:*',
    `_*Razón Social:* ${razon}_`,
    shipment.taxId?.trim() ? `_*Ruc:* ${shipment.taxId.trim()}_` : null,
    shipment.address?.trim() ? `*Dirección:* ${shipment.address.trim()}` : null,
    destino ? `_*Destino:* ${destino}_` : null,
    shipment.attention?.trim() ? `*Atención:* ${shipment.attention.trim()}` : null,
    `${dniPart}${celPart}`,
    `*Agencia:* ${context.agencyDisplay}`,
    '',
    '📕 *Pedido:*',
    ...pedidoLines,
    `Total $${productsUsd} (TC ${exchangeRate}) = Soles S/ ${totalPen}`,
  ]
    .filter((line): line is string => line != null && line.length > 0)
    .join('\n');
}

export function buildShipmentCopyFromForm(
  form: ShipmentFormState,
  agencyDisplay: string,
): string {
  const lineItems = parseLineItems(form.lineItems);
  const exchangeRate = Number(form.exchangeRate) || DEFAULT_EXCHANGE_RATE;
  const shippingCostPen = Number(form.shippingCostPen) || 0;
  const { productsUsd, totalPen } = calcShipmentTotals(lineItems, exchangeRate, shippingCostPen);

  const pedidoLines = lineItems.map(
    (line) =>
      `- ${line.description} $${line.unitPriceUsd} x${line.quantity} = $${line.unitPriceUsd * line.quantity}`,
  );

  const dniPart = form.customerDni.trim() ? `*DNI:* ${form.customerDni.trim()}` : '*DNI:*';
  const celPart = form.customerPhone.trim() ? ` Cel: ${form.customerPhone.trim()}` : '';

  return [
    `📅 ${formatShipmentDate(form.shipmentDate)}`,
    '',
    '🙋‍♀️ *Datos de Envio:*',
    `_*Razón Social:* ${form.razonSocial.trim()}_`,
    form.taxId.trim() ? `_*Ruc:* ${form.taxId.trim()}_` : null,
    form.address.trim() ? `*Dirección:* ${form.address.trim()}` : null,
    form.destination.trim() ? `_*Destino:* ${form.destination.trim()}_` : null,
    form.attention.trim() ? `*Atención:* ${form.attention.trim()}` : null,
    `${dniPart}${celPart}`,
    `*Agencia:* ${agencyDisplay}`,
    '',
    '📕 *Pedido:*',
    ...pedidoLines,
    `Total $${productsUsd} (TC ${exchangeRate}) = Soles S/ ${totalPen}`,
  ]
    .filter((line): line is string => line != null && line.length > 0)
    .join('\n');
}

export const SHIPMENT_CONGRATS_MESSAGE =
  '¡Felicitaciones! El envío quedó registrado correctamente. Ya puedes compartir el resumen con tu cliente o generar la documentación.';
