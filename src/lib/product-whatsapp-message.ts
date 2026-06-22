import { buildWhatsAppMeUrl } from '@/lib/whatsapp-encoding';
import {
  HAITECH_WHATSAPP_MSISDN,
  normalizePeruWhatsAppMsisdn,
} from '@/lib/whatsapp-sales';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { formatPenFromUsd, formatUsd } from '@/lib/utils';

export { HAITECH_WHATSAPP_MSISDN };

export interface ProductWhatsAppLineItem {
  id?: string;
  name: string;
  priceUsd: number;
  category?: string | null;
  brand?: string | null;
  productUrl?: string;
  quantity?: number;
}

export interface BuildProductWhatsAppMessageOptions {
  generateQuote?: boolean;
  quoteNumber?: string;
}

export function buildProductWhatsAppMessage(
  product: ProductWhatsAppLineItem,
  contact: WhatsAppContact,
  options: BuildProductWhatsAppMessageOptions = {},
): string {
  const priceUsd = formatUsd(product.priceUsd);
  const pricePen = formatPenFromUsd(product.priceUsd);
  const meta = [product.brand?.trim(), product.category?.trim()].filter(Boolean).join(' · ');

  const closingLine = options.generateQuote
    ? options.quoteNumber
      ? `¿Podrían brindarme más información o una cotización? (Cotización ${options.quoteNumber} generada)`
      : '¿Podrían brindarme más información o una cotización? (Cotización generada)'
    : '¿Podrían brindarme más información o una cotización?';

  return [
    `¡Hola! Soy *${contact.name.trim()}*`,
    '',
    'Me interesa este producto de la tienda:',
    '',
    `*${product.name.trim()}*`,
    meta ? meta : null,
    product.quantity != null && product.quantity > 1 ? `Cantidad: *${product.quantity}*` : null,
    `Precio: *${priceUsd}* · *${pricePen}*`,
    product.productUrl ? product.productUrl : null,
    '',
    '*Mis datos:*',
    `RUC/Empresa: ${contact.companyOrRuc.trim()}`,
    `Ciudad: ${contact.city.trim()}`,
    '',
    closingLine,
    '¡Gracias!',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function openProductWhatsAppChat(
  product: ProductWhatsAppLineItem,
  contact: WhatsAppContact,
  businessPhone = HAITECH_WHATSAPP_MSISDN,
  options: BuildProductWhatsAppMessageOptions = {},
): boolean {
  const message = buildProductWhatsAppMessage(product, contact, options);
  const msisdn = normalizePeruWhatsAppMsisdn(businessPhone);
  const url = buildWhatsAppMeUrl(msisdn, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
