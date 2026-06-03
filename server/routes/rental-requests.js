import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  createRentalRequestFromBody,
  patchRentalRequest,
  readRentalRequests,
  removeRentalRequest,
} from '../lib/rental-requests-store.js';

export const rentalRequestsRouter = Router();

rentalRequestsRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { requests } = await readRentalRequests();
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

rentalRequestsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const created = await createRentalRequestFromBody(req.body ?? {});
    res.status(201).json({ request: created });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('obligator') || error.message.includes('encontrado'))) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

rentalRequestsRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { requests } = await readRentalRequests();
    const existing = requests.find((entry) => entry.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const updated = await patchRentalRequest(existing, req.body ?? {});
    res.json({ request: updated });
  } catch (error) {
    next(error);
  }
});

rentalRequestsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { requests } = await readRentalRequests();
    const existing = requests.find((entry) => entry.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Solicitud no encontrada' });

    await removeRentalRequest(existing.id, existing.haisupportRentalId);
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});
