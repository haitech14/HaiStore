import { PERSONA_DATA_KEYS, importPersonaCustomerRows, sanitizePersonaData } from './persona-excel.js';
import {
  getHaiSalesSupabaseAdmin,
  HAISALES_TABLE_PERSONA,
  HAISALES_TABLE_VENTAS,
  isHaiSalesRemoteDatabase,
  isHaiSalesSupabaseConfigured,
} from './haisales-supabase.js';
import { getSupabaseAdmin } from './supabase-auth.js';
import { importVentasDocumentRows } from './ventas-excel.js';

const PAGE_SIZE = 500;

function isMissingHaiSalesTable(error, tableName) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const message = String(error.message ?? '').toLowerCase();
  return message.includes(tableName.toLowerCase()) && message.includes('schema cache');
}

/** @param {Record<string, unknown>} row */
function personaDbRowToImportRow(row) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const key of PERSONA_DATA_KEYS) {
    out[key] = row[key] != null ? String(row[key]).trim() : '';
  }
  return sanitizePersonaData(out);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Array<Record<string, string>>} rows
 */
export async function upsertHaiSalesPersonaMirror(supabase, rows) {
  if (rows.length === 0) return { upserted: 0 };

  const payload = rows.map((row) => {
    const record = { ...row, updated_at: new Date().toISOString() };
    const doc = record.numero_documento?.trim();
    if (!doc) return null;
    record.numero_documento = doc;
    return record;
  }).filter(Boolean);

  const { error } = await supabase.from(HAISALES_TABLE_PERSONA).upsert(payload, {
    onConflict: 'numero_documento',
  });

  if (error) {
    if (isMissingHaiSalesTable(error, HAISALES_TABLE_PERSONA)) {
      throw new Error(
        `Falta la tabla ${HAISALES_TABLE_PERSONA}. Aplica supabase/migrations/012_haisales_mirror_tables.sql.`,
      );
    }
    throw new Error(`No se pudo guardar en ${HAISALES_TABLE_PERSONA}: ${error.message}`);
  }

  return { upserted: payload.length };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} [sourceFilename]
 */
export async function upsertHaiSalesVentasMirror(supabase, rows, sourceFilename) {
  if (rows.length === 0) return { upserted: 0 };

  const payload = rows
    .map((row) => {
      const externalKey = String(row.external_key ?? '').trim();
      const invoiceDate = row.invoice_date ? String(row.invoice_date) : null;
      const periodMonth = row.report_period_month ? String(row.report_period_month) : null;
      if (!externalKey || !invoiceDate || !periodMonth) return null;

      /** @type {Record<string, string | number>} */
      const reportPayload = {};
      for (const [key, value] of Object.entries(row)) {
        if (
          [
            'external_key',
            'invoice_date',
            'due_date',
            'report_period_start',
            'report_period_end',
            'report_period_month',
          ].includes(key)
        ) {
          continue;
        }
        if (value != null && value !== '') {
          reportPayload[key] = typeof value === 'number' ? value : String(value);
        }
      }

      return {
        external_key: externalKey,
        invoice_date: invoiceDate,
        report_period_month: periodMonth,
        payload: reportPayload,
        source_filename: sourceFilename ?? null,
        updated_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  const { error } = await supabase.from(HAISALES_TABLE_VENTAS).upsert(payload, {
    onConflict: 'external_key',
  });

  if (error) {
    if (isMissingHaiSalesTable(error, HAISALES_TABLE_VENTAS)) {
      throw new Error(
        `Falta la tabla ${HAISALES_TABLE_VENTAS}. Aplica supabase/migrations/012_haisales_mirror_tables.sql.`,
      );
    }
    throw new Error(`No se pudo guardar en ${HAISALES_TABLE_VENTAS}: ${error.message}`);
  }

  return { upserted: payload.length };
}

async function fetchAllPersonaFromMirror(supabase) {
  /** @type {Array<Record<string, unknown>>} */
  const all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(HAISALES_TABLE_PERSONA)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (isMissingHaiSalesTable(error, HAISALES_TABLE_PERSONA)) {
        throw new Error(
          `Falta la tabla ${HAISALES_TABLE_PERSONA}. Aplica la migración 012_haisales_mirror_tables.sql.`,
        );
      }
      throw new Error(error.message);
    }

    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

async function fetchAllVentasFromMirror(supabase) {
  /** @type {Array<Record<string, unknown>>} */
  const all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(HAISALES_TABLE_VENTAS)
      .select('external_key, invoice_date, report_period_month, payload, source_filename')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (isMissingHaiSalesTable(error, HAISALES_TABLE_VENTAS)) {
        throw new Error(
          `Falta la tabla ${HAISALES_TABLE_VENTAS}. Aplica la migración 012_haisales_mirror_tables.sql.`,
        );
      }
      throw new Error(error.message);
    }

    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

/** Convierte fila espejo HaiSales → fila importación ventas. */
function ventasMirrorRowToImportRow(mirrorRow) {
  const payload =
    mirrorRow.payload && typeof mirrorRow.payload === 'object' ? mirrorRow.payload : {};

  return {
    ...payload,
    external_key: mirrorRow.external_key,
    invoice_date: mirrorRow.invoice_date,
    report_period_month: mirrorRow.report_period_month,
    report_period_start: payload.report_period_start ?? null,
    report_period_end: payload.report_period_end ?? null,
  };
}

/**
 * Lee tablas espejo HaiSales en Supabase y sincroniza hacia HaiStore (clientes + comprobantes).
 */
export async function syncHaiSalesFromDatabase() {
  const haisalesDb = getHaiSalesSupabaseAdmin();
  const storeDb = getSupabaseAdmin();

  if (!haisalesDb) {
    throw new Error(
      'Base HaiSales no configurada. Define HAISALES_API_URL y HAISALES_API_KEY (o SUPABASE_URL + SERVICE_ROLE_KEY).',
    );
  }
  if (!storeDb) {
    throw new Error('Supabase HaiStore no configurado');
  }

  const personaMirrorRows = await fetchAllPersonaFromMirror(haisalesDb);
  const personaImportRows = personaMirrorRows.map((row) => personaDbRowToImportRow(row));
  const persona = await importPersonaCustomerRows(personaImportRows);

  const ventasMirrorRows = await fetchAllVentasFromMirror(haisalesDb);
  const ventasImportRows = ventasMirrorRows.map((row) => ventasMirrorRowToImportRow(row));
  const ventas = await importVentasDocumentRows(ventasImportRows, {
    sourceFilename: 'haisales-database-sync',
  });

  return {
    source: isHaiSalesRemoteDatabase() ? 'remote-supabase' : 'local-supabase',
    tables: {
      persona: HAISALES_TABLE_PERSONA,
      ventas: HAISALES_TABLE_VENTAS,
    },
    mirrorCounts: {
      persona: personaMirrorRows.length,
      ventas: ventasMirrorRows.length,
    },
    persona,
    ventas: {
      created: ventas.created,
      updated: ventas.updated,
      skipped: ventas.skipped,
      total: ventasImportRows.length,
      filesProcessed: 1,
      errors: ventas.errors.map((err) => ({
        file: 'haisales-database',
        row: err.row,
        message: err.message,
      })),
    },
  };
}

/** Copia espejo remoto → espejo local (si HAISALES apunta a otro proyecto). */
export async function mirrorRemoteHaiSalesToStore() {
  if (!isHaiSalesRemoteDatabase()) {
    return { copied: false, persona: 0, ventas: 0 };
  }

  const remote = getHaiSalesSupabaseAdmin();
  const local = getSupabaseAdmin();
  if (!remote || !local) return { copied: false, persona: 0, ventas: 0 };

  const personaRows = await fetchAllPersonaFromMirror(remote);
  const ventasRows = await fetchAllVentasFromMirror(remote);

  const personaImport = personaRows.map((row) => personaDbRowToImportRow(row));
  await upsertHaiSalesPersonaMirror(local, personaImport);

  const ventasPayload = ventasRows.map((row) => ventasMirrorRowToImportRow(row));
  await upsertHaiSalesVentasMirror(local, ventasPayload, 'remote-mirror');

  return { copied: true, persona: personaRows.length, ventas: ventasRows.length };
}

export async function countHaiSalesMirrorRows() {
  const db = getHaiSalesSupabaseAdmin();
  if (!db) {
    return {
      configured: false,
      persona: null,
      ventas: null,
      migrationRequired: false,
    };
  }

  const persona = await db
    .from(HAISALES_TABLE_PERSONA)
    .select('numero_documento', { count: 'exact', head: true });
  const ventas = await db
    .from(HAISALES_TABLE_VENTAS)
    .select('external_key', { count: 'exact', head: true });

  const migrationRequired =
    isMissingHaiSalesTable(persona.error, HAISALES_TABLE_PERSONA) ||
    isMissingHaiSalesTable(ventas.error, HAISALES_TABLE_VENTAS);

  return {
    configured: isHaiSalesSupabaseConfigured(),
    remote: isHaiSalesRemoteDatabase(),
    persona: persona.error ? null : (persona.count ?? 0),
    ventas: ventas.error ? null : (ventas.count ?? 0),
    migrationRequired,
    migration: migrationRequired ? 'supabase/migrations/012_haisales_mirror_tables.sql' : null,
  };
}
