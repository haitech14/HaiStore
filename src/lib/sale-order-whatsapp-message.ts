import { buildWhatsAppShareUrl, WA_EMOJI } from '@/lib/whatsapp-encoding';
import { formatOrderTotal, mapStoreOrderStatusToBadge } from '@/lib/admin-order-status';
import type { StoreOrder } from '@/types/store';

const STATUS_LABELS: Record<ReturnType<typeof mapStoreOrderStatusToBadge>, string> = {
  entregado: 'Entregado',
  enviado: 'Enviado',
  procesando: 'En procesamiento',
  cancelado: 'Cancelado',
};

const PAYMENT_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  failed: 'Fallido',
  refunded: 'Reembolsado',
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function buildSaleOrderWhatsAppMessage(order: StoreOrder): string {
  const status = STATUS_LABELS[mapStoreOrderStatusToBadge(order.status)] ?? order.status;
  const payment = PAYMENT_LABELS[order.payment_status] ?? order.payment_status;
  const total = formatOrderTotal(Number(order.total_usd), order.total_pen, order.currency);

  const itemLines =
    order.items && order.items.length > 0
      ? order.items.map((line) => {
          const name =
            (typeof line.product_snapshot?.name === 'string' && line.product_snapshot.name) ||
            'Producto';
          const qty = line.quantity;
          const lineTotal = Number(line.line_total_usd).toFixed(2);
          return `  • ${qty}× ${name} — $${lineTotal}`;
        })
      : ['  • (sin detalle de ítems)'];

  const phone = order.customer?.phone?.trim();

  return [
    `¡Hola *${customerName(order)}*! ${WA_EMOJI.wave}`,
    '',
    `Te compartimos el resumen de tu *venta Haitech* ${WA_EMOJI.cart}`,
    '',
    `${WA_EMOJI.clipboard} *Nº venta:* ${order.order_number}`,
    `${WA_EMOJI.calendar} *Fecha:* ${formatDate(order.created_at)}`,
    `${WA_EMOJI.package} *Estado:* ${status}`,
    `${WA_EMOJI.creditCard} *Pago:* ${payment}${order.payment_method ? ` · ${order.payment_method}` : ''}`,
    `${WA_EMOJI.money} *Total:* ${total}`,
    phone ? `${WA_EMOJI.mobile} *Contacto:* ${phone}` : null,
    '',
    `${WA_EMOJI.bags} *Detalle:*`,
    ...itemLines,
    '',
    `¿Alguna consulta sobre tu pedido? Estamos para ayudarte ${WA_EMOJI.smile}`,
    '',
    `*Equipo Haitech* ${WA_EMOJI.printer}`,
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function openSaleOrderWhatsApp(order: StoreOrder): boolean {
  const message = buildSaleOrderWhatsAppMessage(order);
  const phone = order.customer?.phone?.trim() ?? '';
  const url = phone ? buildWhatsAppShareUrl(phone, message) : null;
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export async function copySaleOrderWhatsAppMessage(order: StoreOrder): Promise<void> {
  await navigator.clipboard.writeText(buildSaleOrderWhatsAppMessage(order));
}
