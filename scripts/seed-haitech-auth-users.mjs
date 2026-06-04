import 'dotenv/config';

import { getHaitechAuthUsers } from '../server/lib/haitech-auth-credentials.js';
import { getSupabaseAdmin, isSupabaseAuthEnabled } from '../server/lib/supabase-auth.js';

async function ensureProfilesTable(client) {
  const { error } = await client.from('profiles').select('id').limit(1);
  if (!error) return;

  if (error.code === 'PGRST205' || String(error.message).includes('profiles')) {
    console.error(
      'Falta la tabla public.profiles. Ejecuta supabase/migrations/001_profiles_auth.sql en el SQL Editor.',
    );
    process.exit(1);
  }
  throw error;
}

async function upsertProfile(client, userId, entry) {
  const row = {
    id: userId,
    email: entry.email,
    full_name: entry.name,
    role: entry.role,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) {
    console.warn(`  Perfil ${entry.email}: ${error.message}`);
    return false;
  }
  return true;
}

async function seedUser(client, entry) {
  const { data: listed, error: listError } = await client.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) throw listError;

  const existing = listed?.users?.find(
    (user) => user.email?.trim().toLowerCase() === entry.email,
  );

  if (existing) {
    const { error: updateError } = await client.auth.admin.updateUserById(existing.id, {
      password: entry.password,
      email_confirm: true,
      user_metadata: { full_name: entry.name, role: entry.role },
      app_metadata: { role: entry.role },
    });
    if (updateError) {
      console.warn(`  ${entry.email}: no se pudo actualizar contraseña — ${updateError.message}`);
    } else {
      console.log(`  ${entry.email}: contraseña y metadatos actualizados`);
    }
    await upsertProfile(client, existing.id, entry);
    return 'updated';
  }

  const { data: created, error: createError } = await client.auth.admin.createUser({
    email: entry.email,
    password: entry.password,
    email_confirm: true,
    user_metadata: { full_name: entry.name, role: entry.role },
    app_metadata: { role: entry.role },
  });

  if (createError) {
    console.warn(`  ${entry.email}: ${createError.message}`);
    return 'failed';
  }

  await upsertProfile(client, created.user.id, entry);
  console.log(`  ${entry.email}: creado (${entry.role})`);
  return 'created';
}

async function main() {
  if (!isSupabaseAuthEnabled()) {
    console.error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
    process.exit(1);
  }

  const client = getSupabaseAdmin();
  const users = getHaitechAuthUsers();

  console.log(`Sembrando ${users.length} cuentas Haitech en Supabase Auth…`);
  console.log('(Mismas credenciales para HaiStore, HaiSupport y HaiSales)\n');

  await ensureProfilesTable(client);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const entry of users) {
    const result = await seedUser(client, entry);
    if (result === 'created') created += 1;
    else if (result === 'updated') updated += 1;
    else failed += 1;
  }

  console.log(`\nListo: ${created} creados, ${updated} actualizados, ${failed} errores.`);
  console.log('Admin: admin@haitech.pe / admin123');
  console.log('Soporte: soporte@haitech.pe / soporte123');
  console.log('Demos: *@haitech.pe / demo123 (salvo soporte)');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
