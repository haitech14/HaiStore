import type { CompanySettings } from '@/types/company-settings';
import type { ProformaRecord } from '@/types/proforma';
import { formatTpvMoney } from '@/lib/tpv-pricing';
import { WA_EMOJI } from '@/lib/whatsapp-encoding';

export { buildWhatsAppShareUrl } from '@/lib/whatsapp-encoding';

function formatExpiryDate(createdAt: string, validityDays: number): string {
  const expiry = new Date(createdAt);
  expiry.setDate(expiry.getDate() + validityDays);
  return expiry.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function buildProformaWhatsAppMessage(
  proforma: ProformaRecord,
  company: Pick<CompanySettings, 'legalName' | 'phone' | 'email'>,
): string {
  const greeting = proforma.customer.atencion.trim() || proforma.customer.razonSocial;
  const total = formatTpvMoney(proforma.totalPen, proforma.currency);
  const validUntil = formatExpiryDate(proforma.createdAt, proforma.validityDays);

  const lines = proforma.lineItems
    .slice(0, 8)
    .map(
      (line) =>
        `  • ${line.quantity}× ${line.name} — ${formatTpvMoney(line.unitPricePen * line.quantity, proforma.currency)}`,
    );

  if (proforma.lineItems.length > 8) {
    lines.push(`  • … y ${proforma.lineItems.length - 8} producto(s) más`);
  }

  const contactParts = [
    company.phone ? `${WA_EMOJI.phone} ${company.phone}` : null,
    company.email ? `${WA_EMOJI.email} ${company.email}` : null,
  ].filter(Boolean);

  return [
    `¡Hola ${greeting}! ${WA_EMOJI.wave}`,
    '',
    `Te comparto la *cotización ${proforma.documentNumber}* de *${company.legalName}*:`,
    '',
    `${WA_EMOJI.clipboard} *Cliente:* ${proforma.customer.razonSocial}`,
    proforma.customer.documento ? `${WA_EMOJI.idCard} *RUC/DNI:* ${proforma.customer.documento}` : null,
    `${WA_EMOJI.money} *Total:* ${total}`,
    `${WA_EMOJI.calendar} *Válida hasta:* ${validUntil}`,
    '',
    `${WA_EMOJI.cart} *Detalle:*`,
    ...lines,
    '',
    `¿Te ayudo con alguna consulta o para confirmar tu pedido? ${WA_EMOJI.smile}`,
    '',
    `Saludos cordiales,`,
    `*${proforma.sellerName}*`,
    proforma.sellerEmail ? `_${proforma.sellerEmail}_` : null,
    contactParts.length > 0 ? '' : null,
    ...contactParts,
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}
