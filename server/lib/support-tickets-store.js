import { randomUUID } from 'crypto';
import fs from 'fs/promises';

import { getServerDataDir, getSupportTicketsPath } from './server-paths.js';

async function readTickets() {
  try {
    const raw = await fs.readFile(getSupportTicketsPath(), 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.tickets) ? data.tickets : [];
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeTickets(tickets) {
  await fs.mkdir(getServerDataDir(), { recursive: true });
  await fs.writeFile(getSupportTicketsPath(), JSON.stringify({ tickets }, null, 2), 'utf8');
}

/**
 * Persiste tickets de contacto/ruleta cuando HaiSupport no expone POST /tickets.
 * @param {Record<string, unknown>} payload
 */
export async function createLocalSupportTicket(payload) {
  const ticket = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    message: payload.message,
    phone: payload.phone ?? null,
    country: payload.country ?? null,
    type: payload.type ?? 'contact',
    metadata: payload.metadata ?? {},
    status: 'queued',
    source: 'haistore-web',
    createdAt: new Date().toISOString(),
  };

  const tickets = await readTickets();
  tickets.push(ticket);
  await writeTickets(tickets);

  console.log('[support-tickets] guardado localmente:', ticket.id, ticket.type, ticket.email);

  return { id: ticket.id, status: 'queued', local: true };
}
