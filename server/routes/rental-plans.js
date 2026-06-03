import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { shouldUseSharedSupabaseData } from '../lib/data-source.js';
import { notifyHaiSupportChange } from '../lib/haisupport-sync.js';
import { readRentalPlansFromSupabase, writeRentalPlansToSupabase } from '../lib/rental-plans-store.js';

export const rentalPlansRouter = Router();

function normalizePlan(body) {
  const id = String(body.id ?? '').trim();
  const label = String(body.label ?? '').trim();
  const pagesPerMonth = Math.max(1, Number(body.pagesPerMonth ?? body.pages_per_month) || 0);
  const monthlyPricePen = Math.max(0, Number(body.monthlyPricePen ?? body.monthly_price_pen) || 0);
  const active = body.active !== false;

  if (!id || !label || pagesPerMonth <= 0) {
    throw new Error('Plan inválido: id, label y pagesPerMonth son obligatorios');
  }

  return { id, label, pagesPerMonth, monthlyPricePen, active };
}

rentalPlansRouter.get('/', async (_req, res, next) => {
  try {
    const activeOnly = _req.query.active === '1' || _req.query.active === 'true';
    const plans = await readRentalPlansFromSupabase({ activeOnly });
    res.json({ plans: plans ?? [] });
  } catch (error) {
    next(error);
  }
});

rentalPlansRouter.put('/', requireAdmin, async (req, res, next) => {
  try {
    if (!shouldUseSharedSupabaseData()) {
      return res.status(503).json({
        error: 'Configura Supabase para sincronizar planes de alquiler con HaiSupport.',
      });
    }

    const raw = Array.isArray(req.body?.plans) ? req.body.plans : req.body;
    if (!Array.isArray(raw)) {
      return res.status(400).json({ error: 'Se esperaba un array plans' });
    }

    const plans = raw.map(normalizePlan);
    await writeRentalPlansToSupabase(plans);
    notifyHaiSupportChange('rental_plans', 'upsert', plans);
    res.json({ ok: true, plans });
  } catch (error) {
    if (error instanceof Error && error.message.includes('inválido')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});
