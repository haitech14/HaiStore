import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  createServiceRequestFromBody,
  patchServiceCategory,
  patchServiceRequest,
  readServiceCategories,
  readServiceRequests,
  removeServiceRequest,
} from '../lib/service-requests-store.js';

export const serviceRequestsRouter = Router();

serviceRequestsRouter.get('/categories', requireAdmin, async (_req, res, next) => {
  try {
    const categories = await readServiceCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

serviceRequestsRouter.patch('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const category = await patchServiceCategory(req.params.id, req.body ?? {});
    res.json({ category });
  } catch (error) {
    if (error instanceof Error && /actualizar/i.test(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

serviceRequestsRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { requests } = await readServiceRequests();
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

serviceRequestsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const created = await createServiceRequestFromBody(req.body ?? {});
    res.status(201).json({ request: created });
  } catch (error) {
    if (error instanceof Error && error.message.includes('obligator')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

serviceRequestsRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { requests } = await readServiceRequests();
    const existing = requests.find((entry) => entry.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const updated = await patchServiceRequest(existing, req.body ?? {});
    res.json({ request: updated });
  } catch (error) {
    next(error);
  }
});

serviceRequestsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { requests } = await readServiceRequests();
    const existing = requests.find((entry) => entry.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Solicitud no encontrada' });

    await removeServiceRequest(existing.id, existing.haisupportRequestId);
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});
