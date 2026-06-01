import {
  generateShipmentOrderRef,
  generateShipmentTrackingCode,
} from '@/lib/shipping-storage';
import type {
  ShipmentLineItem,
  ShipmentRecord,
  ShippingZone,
  ShippingZoneId,
} from '@/types/shipping';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

export const DEFAULT_EXCHANGE_RATE = 3.859;

export interface ShipmentLineItemForm {
  id: string;
  description: string;
  unitPriceUsd: string;
  quantity: string;
}

export interface ShipmentFormState {
  shipmentDate: string;
  razonSocial: string;
  taxId: string;
  address: string;
  destination: string;
  district: string;
  attention: string;
  customerDni: string;
  customerPhone: string;
  agencyDetail: string;
  orderRef: string;
  trackingCode: string;
  zoneId: ShippingZoneId;
  carrierId: string;
  shippingCostPen: string;
  exchangeRate: string;
  lineItems: ShipmentLineItemForm[];
}

export function createEmptyLineItem(): ShipmentLineItemForm {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    unitPriceUsd: '',
    quantity: '1',
  };
}

export function todayIsoDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function emptyShipmentForm(
  defaults?: Partial<Pick<ShipmentFormState, 'zoneId' | 'carrierId' | 'shippingCostPen'>>,
): ShipmentFormState {
  return {
    shipmentDate: todayIsoDate(),
    razonSocial: '',
    taxId: '',
    address: '',
    destination: '',
    district: '',
    attention: '',
    customerDni: '',
    customerPhone: '',
    agencyDetail: 'A Domicilio',
    orderRef: generateShipmentOrderRef(),
    trackingCode: generateShipmentTrackingCode(defaults?.carrierId ?? 'haitech'),
    zoneId: defaults?.zoneId ?? 'lima-metropolitana',
    carrierId: defaults?.carrierId ?? 'haitech',
    shippingCostPen: defaults?.shippingCostPen ?? '0',
    exchangeRate: String(DEFAULT_EXCHANGE_RATE),
    lineItems: [createEmptyLineItem()],
  };
}

function billingField<T>(billing: Record<string, unknown> | null | undefined, key: string): T | undefined {
  if (!billing || typeof billing !== 'object') return undefined;
  return billing[key] as T | undefined;
}

export function applyStoreCustomerToForm(
  form: ShipmentFormState,
  row: StoreCustomerSearchResult,
): ShipmentFormState {
  const billing = row.default_billing;
  const razon = row.company_name?.trim() || row.full_name?.trim() || row.email;
  const address = billingField<string>(billing, 'address')?.trim() ?? '';
  const destination =
    billingField<string>(billing, 'city')?.trim() ||
    billingField<string>(billing, 'district')?.trim() ||
    '';

  return {
    ...form,
    razonSocial: razon,
    taxId: row.tax_id?.trim() ?? '',
    address,
    destination,
    district: destination || form.district,
    attention: row.full_name?.trim() ?? form.attention,
    customerPhone: row.phone?.trim() ?? form.customerPhone,
    customerDni:
      row.tax_id && row.tax_id.trim().length === 8 ? row.tax_id.trim() : form.customerDni,
  };
}

export function parseLineItems(form: ShipmentLineItemForm[]): ShipmentLineItem[] {
  return form
    .map((row) => ({
      id: row.id,
      description: row.description.trim(),
      unitPriceUsd: Number(row.unitPriceUsd) || 0,
      quantity: Math.max(1, Math.floor(Number(row.quantity) || 1)),
    }))
    .filter((row) => row.description.length > 0);
}

export function calcShipmentTotals(
  lineItems: ShipmentLineItem[],
  exchangeRate: number,
  shippingCostPen: number,
) {
  const productsUsd = lineItems.reduce(
    (sum, line) => sum + line.unitPriceUsd * line.quantity,
    0,
  );
  const productsPen = Math.round(productsUsd * exchangeRate);
  const totalPen = productsPen + shippingCostPen;
  return { productsUsd, productsPen, totalPen };
}

export function etaLabelForZone(zones: ShippingZone[], zoneId: ShippingZoneId): string {
  return zones.find((z) => z.id === zoneId)?.etaBusinessDays ?? 'Por confirmar';
}

export function formToShipmentInput(
  form: ShipmentFormState,
  zones: ShippingZone[],
): Omit<ShipmentRecord, 'id' | 'status' | 'createdAt'> {
  const razonSocial = form.razonSocial.trim();
  const lineItems = parseLineItems(form.lineItems);
  const exchangeRate = Number(form.exchangeRate) || DEFAULT_EXCHANGE_RATE;
  const shippingCostPen = Number(form.shippingCostPen) || 0;

  return {
    orderRef: form.orderRef.trim() || generateShipmentOrderRef(),
    customerName: razonSocial,
    razonSocial,
    taxId: form.taxId.trim() || null,
    address: form.address.trim() || null,
    destination: form.destination.trim() || form.district.trim() || null,
    district: form.district.trim() || form.destination.trim(),
    attention: form.attention.trim() || null,
    customerDni: form.customerDni.trim() || null,
    customerPhone: form.customerPhone.trim() || null,
    agencyDetail: form.agencyDetail.trim() || null,
    zoneId: form.zoneId,
    carrierId: form.carrierId,
    shippingCostPen,
    trackingCode: form.trackingCode.trim() || generateShipmentTrackingCode(form.carrierId),
    shipmentDate: form.shipmentDate || todayIsoDate(),
    etaLabel: etaLabelForZone(zones, form.zoneId),
    exchangeRate,
    lineItems,
  };
}

export function shipmentToForm(shipment: ShipmentRecord): ShipmentFormState {
  const razon = shipment.razonSocial?.trim() || shipment.customerName;
  const items =
    shipment.lineItems && shipment.lineItems.length > 0
      ? shipment.lineItems.map((line) => ({
          id: line.id,
          description: line.description,
          unitPriceUsd: String(line.unitPriceUsd),
          quantity: String(line.quantity),
        }))
      : [createEmptyLineItem()];

  return {
    shipmentDate: shipment.shipmentDate?.slice(0, 10) ?? shipment.createdAt.slice(0, 10),
    razonSocial: razon,
    taxId: shipment.taxId ?? '',
    address: shipment.address ?? '',
    destination: shipment.destination ?? shipment.district ?? '',
    district: shipment.district,
    attention: shipment.attention ?? '',
    customerDni: shipment.customerDni ?? '',
    customerPhone: shipment.customerPhone ?? '',
    agencyDetail: shipment.agencyDetail ?? 'A Domicilio',
    orderRef: shipment.orderRef,
    trackingCode: shipment.trackingCode,
    zoneId: shipment.zoneId,
    carrierId: shipment.carrierId,
    shippingCostPen: String(shipment.shippingCostPen),
    exchangeRate: String(shipment.exchangeRate ?? DEFAULT_EXCHANGE_RATE),
    lineItems: items,
  };
}

export function validateShipmentForm(form: ShipmentFormState): string | null {
  if (!form.razonSocial.trim()) return 'Indica la razón social del cliente.';
  if (!form.destination.trim() && !form.district.trim()) {
    return 'Indica el destino o distrito de entrega.';
  }
  const items = parseLineItems(form.lineItems);
  if (items.length === 0) return 'Agrega al menos un producto al pedido.';
  const rate = Number(form.exchangeRate);
  if (!rate || rate <= 0) return 'El tipo de cambio (TC) debe ser mayor a cero.';
  return null;
}
