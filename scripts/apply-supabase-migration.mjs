/**
 * Aplica un archivo SQL en el proyecto Supabase remoto.
 *
 * Opción A — Management API (recomendado):
 *   1. https://supabase.com/dashboard/account/tokens → Generate token
 *   2. Añade a .env: SUPABASE_ACCESS_TOKEN=sbp_...
 *   3. node scripts/apply-supabase-migration.mjs supabase/migrations/005_products_catalog_fields.sql
 *
 * Opción B — URI de Postgres:
 *   Settings → Database → Connection string (URI) en .env como SUPABASE_DB_URL
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error('Uso: node scripts/apply-supabase-migration.mjs <ruta.sql>');
  process.exit(1);
}

const absPath = resolve(root, sqlFile);
if (!existsSync(absPath)) {
  console.error(`No existe: ${absPath}`);
  process.exit(1);
}

const sql = readFileSync(absPath, 'utf8').trim();
if (!sql) {
  console.error('Archivo SQL vacío');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('No se pudo obtener el project ref de SUPABASE_URL en .env');
  process.exit(1);
}

async function applyViaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) return false;

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body.slice(0, 500)}`);
  }

  console.log(`✓ Migración aplicada vía Management API (${sqlFile})`);
  if (body && body !== '[]' && body !== '{}') {
    console.log(body.slice(0, 300));
  }
  return true;
}

async function applyViaPostgres() {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!dbUrl) return false;

  let pg;
  try {
    pg = await import('pg');
  } catch {
    console.error('Instala pg: npm install --save-dev pg');
    process.exit(1);
  }

  const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`✓ Migración aplicada vía Postgres (${sqlFile})`);
  } finally {
    await client.end();
  }
  return true;
}

async function applyViaCli() {
  const { spawnSync } = await import('child_process');
  const result = spawnSync(
    'npx',
    ['supabase', 'db', 'query', '--linked', '-f', absPath],
    { cwd: root, encoding: 'utf8', shell: true, stdio: 'pipe' },
  );
  if (result.status === 0) {
    console.log(`✓ Migración aplicada vía Supabase CLI (${sqlFile})`);
    return true;
  }
  return false;
}

async function main() {
  console.log(`Proyecto: ${projectRef}`);
  console.log(`SQL: ${sqlFile}\n`);

  if (await applyViaManagementApi()) return;
  if (await applyViaPostgres()) return;
  if (await applyViaCli()) return;

  console.error(`
No hay credenciales para ejecutar DDL en Supabase.

Añade UNA de estas opciones en .env y vuelve a ejecutar:

  SUPABASE_ACCESS_TOKEN=sbp_...   (https://supabase.com/dashboard/account/tokens)

  SUPABASE_DB_URL=postgresql://...  (Dashboard → Settings → Database → URI)

O inicia sesión en CLI y enlaza el proyecto:
  npx supabase login
  npx supabase link --project-ref ${projectRef}
  npx supabase db query -f ${sqlFile} --linked
`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
