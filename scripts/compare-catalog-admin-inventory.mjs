/**
 * Compara productos visibles en catálogo vs inventario admin (mapa del lápiz en tabla).
 * Uso: node scripts/compare-catalog-admin-inventory.mjs [slug]
 * Ejemplo: node scripts/compare-catalog-admin-inventory.mjs multifuncionales
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATEGORY_INVENTORY_LABELS } from '../shared/category-inventory-labels.js';
import { queryProductsByCategory } from '../server/lib/catalog-query.js';
import { listProducts } from '../server/lib/product-catalog.js';
import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_CATALOG_PATH = path.join(__dirname, '../src/data/inventory-catalog.json');

const CATEGORY_SLUGS = [
  'multifuncionales',
  'impresoras',
  'toner-suministros',
  'repuestos',
  'formato-ancho',
  'accesorios',
];

function formatRow(product) {
  const code = product.product_code ?? product.sku ?? '';
  return `${product.id} · ${product.name}${code ? ` (${code})` : ''}`;
}

function buildAdminMap(products) {
  const map = new Map();
  const errors = [];
  for (const raw of products) {
    try {
      const product = migrateInventoryProduct(raw);
      map.set(product.id, product);
    } catch (error) {
      errors.push({
        id: raw?.id ?? '(sin id)',
        name: raw?.name ?? '(sin nombre)',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { map, errors };
}

async function loadCatalogForSlug(slug) {
  const labels = CATEGORY_INVENTORY_LABELS[slug] ?? [];
  if (labels.length === 0) return { slug, products: [], total: 0 };

  const result = await queryProductsByCategory({
    role: 'public',
    slug,
    subSlug: null,
    labels,
    sortBy: 'price-asc',
    page: 1,
    limit: 500,
  });

  return {
    slug,
    products: result.products ?? [],
    total: result.total ?? result.products?.length ?? 0,
  };
}

function loadStaticCatalogIds() {
  if (!existsSync(STATIC_CATALOG_PATH)) return new Set();
  const data = JSON.parse(readFileSync(STATIC_CATALOG_PATH, 'utf8'));
  const products = Array.isArray(data?.products) ? data.products : [];
  return new Set(products.map((p) => p.id).filter(Boolean));
}

function compareCatalogToAdmin(catalogProducts, adminMap) {
  const missing = [];
  for (const product of catalogProducts) {
    if (!adminMap.has(product.id)) {
      missing.push(product);
    }
  }
  return missing;
}

function printSection(title) {
  console.log(`\n${'─'.repeat(72)}`);
  console.log(title);
  console.log('─'.repeat(72));
}

async function main() {
  const targetSlug = process.argv[2]?.trim() || null;
  const slugs = targetSlug ? [targetSlug] : CATEGORY_SLUGS;

  const inventoryPath = getInventoryPath();
  if (!existsSync(inventoryPath)) {
    console.error(`No se encontró inventario en ${inventoryPath}`);
    process.exit(1);
  }

  printSection('Fuentes');
  console.log(`Inventario: ${inventoryPath}`);
  console.log(`Fallback estático: ${STATIC_CATALOG_PATH}`);

  const adminProducts = await listProducts({ role: 'public', adminView: true });
  const publicProducts = await listProducts({ role: 'public', adminView: false });

  const { map: adminMap, errors: adminMigrateErrors } = buildAdminMap(adminProducts);

  printSection('Resumen inventario');
  console.log(`Productos admin (API /admin/all): ${adminProducts.length}`);
  console.log(`Productos públicos (listProducts): ${publicProducts.length}`);
  console.log(`Mapa admin tras migrate: ${adminMap.size}`);
  if (adminMigrateErrors.length > 0) {
    console.log(`Errores al migrar (no entran al mapa): ${adminMigrateErrors.length}`);
    for (const err of adminMigrateErrors) {
      console.log(`  · ${err.id} — ${err.name}: ${err.message}`);
    }
  }

  const publicNotInAdmin = publicProducts.filter((p) => !adminMap.has(p.id));
  if (publicNotInAdmin.length > 0) {
    printSection('Catálogo público sin entrada en mapa admin (global)');
    for (const product of publicNotInAdmin) {
      console.log(`  · ${formatRow(product)}`);
    }
  } else {
    printSection('Catálogo público vs admin (global)');
    console.log('✓ Todos los productos públicos tienen entrada en el mapa admin.');
  }

  const staticIds = loadStaticCatalogIds();
  const adminIds = new Set(adminMap.keys());
  const staticOnly = [...staticIds].filter((id) => !adminIds.has(id));
  const liveOnly = [...adminIds].filter((id) => !staticIds.has(id));

  printSection('Fallback estático (inventory-catalog.json) vs inventario vivo');
  console.log(`IDs en JSON estático: ${staticIds.size}`);
  if (staticOnly.length > 0) {
    console.log(`En JSON pero NO en inventario vivo (${staticOnly.length}):`);
    for (const id of staticOnly.slice(0, 20)) {
      console.log(`  · ${id}`);
    }
    if (staticOnly.length > 20) {
      console.log(`  … y ${staticOnly.length - 20} más`);
    }
  } else {
    console.log('✓ Ningún ID del JSON estático falta en inventario vivo.');
  }
  if (liveOnly.length > 0) {
    console.log(`Solo en inventario vivo (no en JSON): ${liveOnly.length} productos`);
  }

  let totalMissingInTable = 0;

  for (const slug of slugs) {
    const { products, total } = await loadCatalogForSlug(slug);
    const missing = compareCatalogToAdmin(products, adminMap);
    totalMissingInTable += missing.length;

    printSection(`Categoría: ${slug} (${products.length} visibles / ${total} total filtrado)`);
    if (missing.length === 0) {
      console.log('✓ Todos los productos de esta categoría tienen lápiz de edición (catalogEntry).');
      continue;
    }

    console.log(`Sin entrada admin (${missing.length}) — NO mostrarían lápiz en tabla:`);
    for (const product of missing) {
      console.log(`  · ${formatRow(product)}`);
      console.log(`    categoría: ${product.category ?? '—'}`);
    }
  }

  printSection('Conclusión');
  if (totalMissingInTable === 0 && publicNotInAdmin.length === 0 && adminMigrateErrors.length === 0) {
    console.log(
      'No hay productos visibles en catálogo sin entrada en inventario admin. El lápiz debería aparecer en todas las filas (si eres admin y el inventario cargó).',
    );
  } else if (totalMissingInTable > 0) {
    console.log(
      `${totalMissingInTable} fila(s) en tabla podrían no mostrar lápiz. Revisa la lista por categoría arriba.`,
    );
  }

  if (adminMigrateErrors.length > 0) {
    console.log(
      'Hay productos que fallan al migrar en servidor; el cliente podría omitirlos además con normalizeInventoryProduct.',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
