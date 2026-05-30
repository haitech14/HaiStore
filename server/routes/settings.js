import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { readCompanySettings, writeCompanySettings } from '../lib/company-settings-store.js';

export const settingsRouter = Router();

settingsRouter.get('/company', async (_req, res, next) => {
  try {
    const settings = await readCompanySettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

settingsRouter.put('/company', requireAdmin, async (req, res, next) => {
  try {
    const settings = await writeCompanySettings(req.body ?? {});
    res.json(settings);
  } catch (error) {
    next(error);
  }
});
