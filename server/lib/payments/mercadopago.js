import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

function getAccessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? '';
}

function getClient() {
  const token = getAccessToken();
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export function isMercadoPagoConfigured() {
  return Boolean(getAccessToken());
}

function resolveCheckoutBaseUrl() {
  const configured = process.env.CHECKOUT_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5173';
}

/**
 * @param {{
 *   orderId: string;
 *   orderNumber: string;
 *   totalPen: number;
 *   payerEmail: string;
 *   payerName?: string;
 *   items: Array<{ title: string; quantity: number; unitPricePen: number }>;
 * }} params
 */
export async function createMercadoPagoPreference(params) {
  const client = getClient();
  if (!client) {
    throw new Error('Mercado Pago no configurado (MERCADOPAGO_ACCESS_TOKEN)');
  }

  const baseUrl = resolveCheckoutBaseUrl();
  const preferenceApi = new Preference(client);

  const mpItems = params.items.map((item) => ({
    id: item.title.slice(0, 50),
    title: item.title.slice(0, 256),
    quantity: item.quantity,
    unit_price: Math.round(item.unitPricePen * 100) / 100,
    currency_id: 'PEN',
  }));

  const notificationUrl = `${baseUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`;

  const result = await preferenceApi.create({
    body: {
      items: mpItems,
      payer: {
        email: params.payerEmail,
        name: params.payerName ?? undefined,
      },
      external_reference: params.orderId,
      metadata: {
        order_number: params.orderNumber,
      },
      back_urls: {
        success: `${baseUrl}/checkout/pago/mercadopago?status=success&order=${encodeURIComponent(params.orderNumber)}`,
        failure: `${baseUrl}/checkout/pago/mercadopago?status=failure&order=${encodeURIComponent(params.orderNumber)}`,
        pending: `${baseUrl}/checkout/pago/mercadopago?status=pending&order=${encodeURIComponent(params.orderNumber)}`,
      },
      auto_return: 'approved',
      notification_url: notificationUrl,
    },
  });

  return result;
}

/**
 * @param {string | number} paymentId
 */
export async function getMercadoPagoPayment(paymentId) {
  const client = getClient();
  if (!client) {
    throw new Error('Mercado Pago no configurado');
  }

  const paymentApi = new Payment(client);
  return paymentApi.get({ id: paymentId });
}
