import { buildAgencyDisplay, buildShipmentCopyMessage } from '@/lib/shipment-copy-message';
import { buildWhatsAppShareUrl } from '@/lib/whatsapp-encoding';
import type { ShipmentRecord } from '@/types/shipping';

export interface ShipmentWhatsAppContext {
  carrierName: string;
}

export function buildShipmentWhatsAppMessage(
  shipment: ShipmentRecord,
  context: ShipmentWhatsAppContext,
): string {
  const agencyDisplay = buildAgencyDisplay(context.carrierName, shipment.agencyDetail);
  return buildShipmentCopyMessage(shipment, { agencyDisplay });
}

export function openShipmentWhatsApp(
  shipment: ShipmentRecord,
  context: ShipmentWhatsAppContext,
): boolean {
  const message = buildShipmentWhatsAppMessage(shipment, context);
  const phone = shipment.customerPhone?.trim() ?? '';
  const url = phone ? buildWhatsAppShareUrl(phone, message) : null;

  if (!url) return false;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export async function copyShipmentWhatsAppMessage(
  shipment: ShipmentRecord,
  context: ShipmentWhatsAppContext,
): Promise<string> {
  const message = buildShipmentWhatsAppMessage(shipment, context);
  await navigator.clipboard.writeText(message);
  return message;
}
