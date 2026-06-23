const CULQI_API = 'https://api.culqi.com/v2';

function getSecretKey() {
  return process.env.CULQI_SECRET_KEY?.trim() ?? '';
}

export function isCulqiConfigured() {
  return Boolean(getSecretKey());
}

export function getCulqiPublicKey() {
  return process.env.CULQI_PUBLIC_KEY?.trim() ?? process.env.VITE_CULQI_PUBLIC_KEY?.trim() ?? '';
}

/**
 * @param {{ amountPen: number; email: string; token: string; orderId: string; orderNumber?: string | null }} params
 */
export async function createCulqiCharge(params) {
  const secretKey = getSecretKey();
  if (!secretKey) {
    throw new Error('Culqi no configurado (CULQI_SECRET_KEY)');
  }

  const amountCents = Math.round(params.amountPen * 100);
  if (amountCents < 100) {
    throw new Error('El monto mínimo para Culqi es S/ 1.00');
  }

  const response = await fetch(`${CULQI_API}/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountCents,
      currency_code: 'PEN',
      email: params.email,
      source_id: params.token,
      description: params.orderNumber ? `Pedido ${params.orderNumber}` : `Pedido ${params.orderId}`,
      metadata: {
        order_id: params.orderId,
        order_number: params.orderNumber ?? null,
      },
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body?.user_message === 'string'
        ? body.user_message
        : typeof body?.merchant_message === 'string'
          ? body.merchant_message
          : 'No se pudo procesar el pago con tarjeta';
    const error = new Error(message);
    error.culqiResponse = body;
    throw error;
  }

  return body;
}
