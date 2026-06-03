/**
 * Cliente para la integración con HaiSupport.
 *
 * Si HAISUPPORT_API_URL / HAISUPPORT_API_KEY no están configuradas,
 * funciona en modo "demo" y solo registra el ticket en consola.
 */

const TIMEOUT_MS = 10_000;

function getApiBaseUrl() {
  const raw = process.env.HAISUPPORT_API_URL?.trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

/**
 * @param {{
 *   name: string;
 *   email: string;
 *   message: string;
 *   phone?: string;
 *   country?: string;
 *   type?: string;
 *   metadata?: Record<string, unknown>;
 * }} payload
 */
export async function createSupportTicket(payload) {
  const API_URL = getApiBaseUrl();
  const API_KEY = process.env.HAISUPPORT_API_KEY?.trim();
  const { name, email, message, phone, country, type, metadata } = payload;

  if (!API_URL || !API_KEY) {
    console.log('[haisupport] modo demo — ticket simulado:', {
      name,
      email,
      type: type ?? 'contact',
    });
    return { id: `demo-${Date.now()}`, status: 'queued', demo: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        name,
        email,
        message,
        phone: phone ?? null,
        country: country ?? null,
        type: type ?? 'contact',
        metadata: metadata ?? {},
        source: 'haistore-web',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[haisupport] error HTTP', response.status, body.slice(0, 300));
      throw new Error(`No se pudo crear el ticket en HaiSupport (${response.status}).`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('HaiSupport no respondió a tiempo. Intenta de nuevo en unos segundos.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
