import { Router } from 'express';

import { requireAdmin, resolveUserFromToken } from '../lib/auth-store.js';
import {
  createProformaFromBody,
  patchProforma,
  readProformas,
  removeProforma,
  saveProforma,
} from '../lib/proformas-store.js';
import { getClientIp, isSupportRateLimited } from '../lib/support-rate-limit.js';

export const proformasRouter = Router();

const STORE_SELLER = { name: 'Tienda en línea', email: '' };

/** Cotización desde ficha de producto (clientes públicos o autenticados). */
proformasRouter.post('/from-product', async (req, res, next) => {
  const clientKey = `proforma-product:${getClientIp(req)}`;
  if (isSupportRateLimited(clientKey)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espere un minuto e inténtelo de nuevo.' });
  }

  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const user = (await resolveUserFromToken(token)) ?? STORE_SELLER;

    const created = createProformaFromBody(
      { ...(req.body ?? {}), source: 'product', documentType: 'proforma' },
      { user },
    );
    const saved = await saveProforma(created, 'create');
    res.status(201).json({ proforma: saved });
  } catch (error) {
    if (error instanceof Error && error.message.includes('requiere')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

proformasRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { proformas } = await readProformas();
    res.json({ proformas });
  } catch (error) {
    next(error);
  }
});

proformasRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const created = createProformaFromBody(req.body ?? {}, req);
    const saved = await saveProforma(created, 'create');
    res.status(201).json({ proforma: saved });
  } catch (error) {
    if (error instanceof Error && error.message.includes('requiere')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

proformasRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { proformas } = await readProformas();
    const index = proformas.findIndex((entry) => entry.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Proforma no encontrada' });

    const updated = patchProforma(proformas[index], req.body ?? {});
    const saved = await saveProforma(updated, 'update');
    res.json({ proforma: saved });
  } catch (error) {
    next(error);
  }
});

proformasRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { proformas } = await readProformas();
    if (!proformas.some((entry) => entry.id === req.params.id)) {
      return res.status(404).json({ error: 'Proforma no encontrada' });
    }
    await removeProforma(req.params.id);
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});
