/**
 * Genera public/catalog/home-bundle.json para carga instantánea de la landing.
 * Uso: node scripts/generate-home-bundle-snapshot.mjs
 *
 * Si no hay inventario local, termina sin error (mantiene snapshot previo en build).
 */
import 'dotenv/config';
import { existsSync } from 'node:fs';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { regenerateHomeBundleSnapshot } from '../server/lib/home-catalog-bundle-snapshot.js';

async function main() {
  const inventoryPath = getInventoryPath();
  if (!existsSync(inventoryPath)) {
    console.warn(
      `[generate:home-bundle] Sin inventario en ${inventoryPath}; snapshot no actualizado.`,
    );
    return;
  }

  const { filePath, bundle } = await regenerateHomeBundleSnapshot('public');
  console.log(`✓ Snapshot de home escrito en ${filePath}`);
  console.log(
    `  Destacados: ${bundle.featured.length} · Secciones: ${bundle.sections.length}`,
  );
}

main().catch((error) => {
  console.warn(
    '[generate:home-bundle] omitido:',
    error instanceof Error ? error.message : error,
  );
  process.exit(0);
});
