import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  getHaiSalesIntegrationStatus,
  getHaiSalesResumen,
  importPersonaFromSeeds,
  importVentasFromBuffers,
  importVentasFromSeeds,
  mirrorRemoteHaiSalesToStore,
  syncHaiSalesFromDatabase,
  syncHaiSalesFromSeeds,
} from '../lib/haisales-import.js';
import { verifyHaiSalesWebhookSecret } from '../lib/haisales-config.js';
import { importPersonaCustomerRows, parsePersonaWorkbook, sanitizePersonaData } from '../lib/persona-excel.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const haisalesIntegrationRouter = Router();

haisalesIntegrationRouter.get('/status', requireAdmin, async (_req, res, next) => {
  try {
    const status = await getHaiSalesIntegrationStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

haisalesIntegrationRouter.get('/resumen', requireAdmin, async (req, res, next) => {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : 'all';
    const resumen = await getHaiSalesResumen(month);
    res.json(resumen);
  } catch (error) {
    next(error);
  }
});

haisalesIntegrationRouter.post('/sync-seeds', requireAdmin, async (_req, res, next) => {
  try {
    if (!getSupabaseAdmin()) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }
    const result = await syncHaiSalesFromSeeds();
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

haisalesIntegrationRouter.post('/sync-database', requireAdmin, async (req, res, next) => {
  try {
    if (!getSupabaseAdmin()) {
      return res.status(503).json({ error: 'Supabase HaiStore no configurado' });
    }

    const mirrorRemote = req.body?.mirrorRemote === true;
    let remoteMirror = null;
    if (mirrorRemote) {
      remoteMirror = await mirrorRemoteHaiSalesToStore();
    }

    const database = await syncHaiSalesFromDatabase();
    res.json({ ok: true, remoteMirror, database });
  } catch (error) {
    next(error);
  }
});

haisalesIntegrationRouter.post('/import/persona', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    let rows = [];

    if (Array.isArray(body.rows)) {
      rows = body.rows.map((row) => sanitizePersonaData(row));
    } else if (body.fileBase64 && typeof body.fileBase64 === 'string') {
      rows = parsePersonaWorkbook(Buffer.from(body.fileBase64, 'base64'));
    } else if (body.fromSeeds === true) {
      const result = await importPersonaFromSeeds();
      return res.json(result);
    } else {
      return res.status(400).json({
        error: 'Envía `fileBase64`, `rows`, o `fromSeeds: true`.',
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'El archivo no contiene filas válidas.' });
    }

    const result = await importPersonaCustomerRows(rows);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

haisalesIntegrationRouter.post('/import/ventas', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};

    if (body.fromSeeds === true) {
      const result = await importVentasFromSeeds();
      return res.json(result);
    }

    /** @type {Array<{ buffer: Buffer; filename: string }>} */
    const files = [];

    if (Array.isArray(body.files)) {
      for (const entry of body.files) {
        if (entry?.fileBase64 && typeof entry.fileBase64 === 'string') {
          files.push({
            buffer: Buffer.from(entry.fileBase64, 'base64'),
            filename: typeof entry.filename === 'string' ? entry.filename : 'import.xlsx',
          });
        }
      }
    } else if (body.fileBase64 && typeof body.fileBase64 === 'string') {
      files.push({
        buffer: Buffer.from(body.fileBase64, 'base64'),
        filename: typeof body.filename === 'string' ? body.filename : 'import.xlsx',
      });
    } else {
      return res.status(400).json({
        error: 'Envía `fileBase64`, `files`, o `fromSeeds: true`.',
      });
    }

    if (files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos válidos.' });
    }

    const result = await importVentasFromBuffers(files);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Webhook HaiSales → HaiStore (futuro: push de comprobantes o clientes).
 * Por ahora acepta entity customers|ventas con action upsert y delega a importadores.
 */
haisalesIntegrationRouter.post('/webhook', async (req, res, next) => {
  try {
    const secret = req.headers['x-haisales-secret'];
    if (!verifyHaiSalesWebhookSecret(secret)) {
      return res.status(401).json({ error: 'Webhook no autorizado' });
    }

    if (!getSupabaseAdmin()) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const { entity, action, payload } = req.body ?? {};
    if (!entity || !action) {
      return res.status(400).json({ error: 'Faltan entity y action' });
    }

    if (entity === 'customers' && action === 'upsert' && Array.isArray(payload?.rows)) {
      const result = await importPersonaCustomerRows(
        payload.rows.map((row) => sanitizePersonaData(row)),
      );
      return res.json({ ok: true, entity, action, result });
    }

    if (entity === 'ventas' && action === 'upsert' && payload?.fileBase64) {
      const buffer = Buffer.from(String(payload.fileBase64), 'base64');
      const result = await importVentasFromBuffers([
        {
          buffer,
          filename: typeof payload.filename === 'string' ? payload.filename : 'webhook.xlsx',
        },
      ]);
      return res.json({ ok: true, entity, action, result });
    }

    return res.status(400).json({ error: `Payload no soportado para ${entity}/${action}` });
  } catch (error) {
    next(error);
  }
});
