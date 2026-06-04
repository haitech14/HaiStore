import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { shouldUseSharedSupabaseData } from '../lib/data-source.js';
import { verifyHaiSupportWebhookSecret } from '../lib/haisupport-sync.js';
import {
  haitechClientToStoreCustomerRow,
  inboundPayloadToHaitechClient,
} from '../lib/haitech-mappers.js';
import {
  deleteProformaFromSupabase,
  upsertProformaInSupabase,
} from '../lib/proformas-supabase.js';
import {
  deleteRentalPlanFromSupabase,
  upsertRentalRequestFromInbound,
} from '../lib/rental-requests-store.js';
import { upsertRentalPlanInSupabase, writeRentalPlansToSupabase } from '../lib/rental-plans-store.js';
import {
  deleteStoreOrderFromInbound,
  upsertStoreOrderFromInbound,
} from '../lib/orders-store.js';
import {
  upsertServiceRequestFromInbound,
} from '../lib/service-requests-store.js';
import { syncProductFromHaiSupport, deleteProductFromHaiSupport } from '../lib/haisupport-inbound.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';
import { haisalesIntegrationRouter } from './haisales-integration.js';

export const integrationsRouter = Router();

integrationsRouter.use('/haisales', haisalesIntegrationRouter);

async function syncCustomerFromHaiSupport(action, payload) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !payload?.id) return;

  if (action === 'delete') {
    await supabase.from('store_customers').delete().eq('id', payload.id);
    return;
  }

  const client = inboundPayloadToHaitechClient(payload);
  const row = haitechClientToStoreCustomerRow(
    { ...client, id: payload.id, source: 'haisupport', haisupportClientId: payload.id },
    payload.id,
  );
  row.created_at = payload.created_at ?? payload.createdAt ?? new Date().toISOString();

  await supabase.from('store_customers').upsert(row, { onConflict: 'id' });
}

integrationsRouter.post('/haisupport/webhook', async (req, res, next) => {
  try {
    const secret = req.headers['x-haisupport-secret'];
    if (!verifyHaiSupportWebhookSecret(secret)) {
      return res.status(401).json({ error: 'Webhook no autorizado' });
    }

    if (!shouldUseSharedSupabaseData()) {
      return res.status(503).json({ error: 'Supabase compartido no configurado en HaiStore' });
    }

    const { entity, action, payload } = req.body ?? {};
    if (!entity || !action) {
      return res.status(400).json({ error: 'Faltan entity y action' });
    }

    switch (entity) {
      case 'products':
        if (action === 'delete') {
          await deleteProductFromHaiSupport(payload?.id);
        } else {
          await syncProductFromHaiSupport(payload);
        }
        break;
      case 'customers':
        await syncCustomerFromHaiSupport(action, payload);
        break;
      case 'proformas':
        if (action === 'delete') {
          await deleteProformaFromSupabase(payload?.id);
        } else if (payload) {
          await upsertProformaInSupabase(payload);
        }
        break;
      case 'rental_plans':
        if (action === 'delete') {
          await deleteRentalPlanFromSupabase(payload?.id);
        } else if (Array.isArray(payload)) {
          await writeRentalPlansToSupabase(payload);
        } else if (payload) {
          await upsertRentalPlanInSupabase(payload);
        }
        break;
      case 'service_requests':
        if (action === 'delete') {
          if (payload?.id) {
            const supabase = getSupabaseAdmin();
            if (supabase) await supabase.from('store_service_requests').delete().eq('id', payload.id);
          }
        } else if (payload) {
          await upsertServiceRequestFromInbound(payload);
        }
        break;
      case 'rental_requests':
        if (action === 'delete') {
          if (payload?.id) {
            const supabase = getSupabaseAdmin();
            if (supabase) await supabase.from('store_rental_requests').delete().eq('id', payload.id);
          }
        } else if (payload) {
          await upsertRentalRequestFromInbound(payload);
        }
        break;
      case 'orders':
        if (action === 'delete') {
          await deleteStoreOrderFromInbound(payload?.id);
        } else if (payload) {
          await upsertStoreOrderFromInbound(payload);
        }
        break;
      default:
        return res.status(400).json({ error: `Entidad no soportada: ${entity}` });
    }

    res.json({ ok: true, entity, action });
  } catch (error) {
    next(error);
  }
});

integrationsRouter.get('/haisupport/status', requireAdmin, (_req, res) => {
  res.json({
    sharedSupabase: shouldUseSharedSupabaseData(),
    outboundSync: process.env.HAISUPPORT_SYNC_ENABLED === 'true',
    webhookConfigured: Boolean(process.env.HAISUPPORT_WEBHOOK_SECRET?.trim()),
    haisupportSupabaseBridge: Boolean(
      process.env.HAISUPPORT_API_URL?.includes('supabase.co') && process.env.HAISUPPORT_API_KEY?.trim(),
    ),
    entities: {
      products: { outbound: true, inbound: true },
      customers: { outbound: true, inbound: true },
      proformas: { outbound: true, inbound: true },
      rental_plans: { outbound: true, inbound: true },
      service_requests: { outbound: true, inbound: true },
      rental_requests: { outbound: true, inbound: true },
      orders: { outbound: true, inbound: true },
    },
    haisales: {
      statusUrl: '/api/integrations/haisales/status',
      syncSeedsUrl: '/api/integrations/haisales/sync-seeds',
    },
  });
});
