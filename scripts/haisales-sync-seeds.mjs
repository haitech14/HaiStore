import 'dotenv/config';

import { getSupabaseAdmin } from '../server/lib/supabase-auth.js';
import { syncHaiSalesFromSeeds } from '../server/lib/haisales-import.js';

async function main() {
  if (!getSupabaseAdmin()) {
    console.error(
      'Supabase no configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env',
    );
    process.exit(1);
  }

  console.log('[HaiSales] Sincronizando desde data/seeds…\n');
  const { persona, ventas } = await syncHaiSalesFromSeeds();

  console.log(
    `Persona: ${persona.filesProcessed} archivo(s), ${persona.created} creados, ${persona.updated} actualizados, ${persona.errors.length} errores.`,
  );
  console.log(
    `Ventas: ${ventas.filesProcessed} archivo(s), ${ventas.created} creados, ${ventas.updated} actualizados, ${ventas.errors.length} errores.`,
  );

  if (persona.errors.length + ventas.errors.length > 0) {
    for (const err of [...persona.errors, ...ventas.errors].slice(0, 10)) {
      console.log(`  ${err.file} fila ${err.row}: ${err.message}`);
    }
  }

  if (persona.created + persona.updated + ventas.created + ventas.updated === 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
