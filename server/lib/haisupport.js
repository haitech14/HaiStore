/**
 * Cliente para la integración con HaiSupport.
 *
 * Si HAISUPPORT_API_URL apunta a Supabase (sin API REST /tickets) o el remoto falla,
 * el ticket se guarda en server/data/support-tickets.json.
 */

import { createLocalSupportTicket } from './support-tickets-store.js';

const TIMEOUT_MS = 10_000;

function getApiBaseUrl() {
  const raw = process.env.HAISUPPORT_API_URL?.trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

function isSupabaseProjectUrl(url) {
  return /\.supabase\.co$/i.test(url) || url.includes('.supabase.co/');
}

function hasDedicatedTicketsApi(url) {
  const dedicated = process.env.HAISUPPORT_TICKETS_URL?.trim();
  if (dedicated) return dedicated.replace(/\/+$/, '');
  if (!url || isSupabaseProjectUrl(url)) return '';
  return url;
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
  const ticketsApiUrl = hasDedicatedTicketsApi(API_URL);

  if (!ticketsApiUrl || !API_KEY) {
    return createLocalSupportTicket(payload);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ticketsApiUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        phone: payload.phone ?? null,
        country: payload.country ?? null,
        type: payload.type ?? 'contact',
        metadata: payload.metadata ?? {},
        source: 'haistore-web',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[haisupport] error HTTP', response.status, body.slice(0, 300));
      if (response.status === 404 || response.status >= 500) {
        console.warn('[haisupport] remoto no disponible; usando respaldo local');
        return createLocalSupportTicket(payload);
      }
      throw new Error(`No se pudo crear el ticket en HaiSupport (${response.status}).`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[haisupport] timeout; usando respaldo local');
      return createLocalSupportTicket(payload);
    }
    console.warn(
      '[haisupport] remoto falló; usando respaldo local:',
      error instanceof Error ? error.message : error,
    );
    return createLocalSupportTicket(payload);
  } finally {
    clearTimeout(timeout);
  }
}
