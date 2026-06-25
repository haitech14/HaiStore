import fs from 'fs/promises';

import { queryProductsByCategory } from '../server/lib/catalog-query.js';
import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

const DEFAULT_PAGES = 20;
const DEFAULT_PAGE_SIZE = 25; // /tienda suele usar grilla 5×5 (sidebar layout)
const DEFAULT_BUMP_USD = 5;
const DEFAULT_START_PAGE = 1;

function parseNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function bumpPrice(value, bumpUsd) {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return Math.max(0, Math.round((num + bumpUsd) * 100) / 100);
}

async function main() {
  const args = new Map();
  for (const raw of process.argv.slice(2)) {
    const [key, val] = raw.split('=');
    if (key && val != null) args.set(key.replace(/^--/, ''), val);
  }

  const startPage = Math.max(1, Math.floor(parseNumber(args.get('startPage'), DEFAULT_START_PAGE)));
  const pages = parseNumber(args.get('pages'), DEFAULT_PAGES);
  const pageSize = parseNumber(args.get('pageSize'), DEFAULT_PAGE_SIZE);
  const bumpUsd = parseNumber(args.get('bumpUsd'), DEFAULT_BUMP_USD);
  const dryRun = process.argv.includes('--dry-run');

  const totalRequested = Math.max(1, Math.floor(pages * pageSize));
  const maxPerQuery = 500;
  const safeLimit = Math.min(maxPerQuery, totalRequested);

  const ids = [];

  // Caso 1: página 1 — podemos pedir un batch grande (hasta 500).
  if (startPage === 1) {
    const result = await queryProductsByCategory({
      role: 'public',
      slug: '',
      labels: [],
      sortBy: 'price-asc',
      page: 1,
      limit: safeLimit,
    });
    ids.push(...(result?.products ?? []).map((p) => p.id).filter(Boolean));
  } else {
    // Caso 2: páginas > 1 — el `page` depende de `limit`, así que usamos `pageSize`.
    let remainingPages = Math.max(1, Math.floor(pages));
    let page = startPage;
    while (remainingPages > 0) {
      const result = await queryProductsByCategory({
        role: 'public',
        slug: '',
        labels: [],
        sortBy: 'price-asc',
        page,
        limit: pageSize,
      });
      const batchIds = (result?.products ?? []).map((p) => p.id).filter(Boolean);
      if (batchIds.length === 0) break;
      ids.push(...batchIds);
      remainingPages -= 1;
      page += 1;
      if (result?.page && result?.totalPages && result.page >= result.totalPages) break;
    }
  }

  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) {
    console.error('No se pudieron resolver productos del catálogo para /tienda.');
    process.exit(1);
  }

  const { products, deletedProductIds, warehouses } = await readInventory();

  let updated = 0;
  const missing = [];

  const nextProducts = products.map((p) => ({ ...p }));
  const nextById = new Map(nextProducts.map((p) => [p.id, p]));

  for (const id of uniqueIds) {
    const product = nextById.get(id);
    if (!product) {
      missing.push(id);
      continue;
    }

    const prices = typeof product.prices === 'object' && product.prices ? { ...product.prices } : null;
    const beforePublic = prices?.public ?? product.price ?? 0;
    const afterPublic = bumpPrice(beforePublic, bumpUsd);

    if (prices) {
      prices.public = afterPublic;
      product.prices = prices;
    } else {
      product.prices = { public: afterPublic };
    }
    product.price = afterPublic;
    updated += 1;
  }

  console.log(`\nRango objetivo: desde página ${startPage} (páginas ${pages} × ${pageSize})`);
  console.log(`Productos objetivo: ${uniqueIds.length}`);
  console.log(`Actualizados (+$${bumpUsd} a precio público): ${updated}`);
  if (missing.length > 0) {
    console.log(`No encontrados en inventario: ${missing.length}`);
    console.log(missing.slice(0, 20).join('\n'));
    if (missing.length > 20) console.log(`(… ${missing.length - 20} más)`);
  }

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  await writeInventory(
    {
      products: nextProducts,
      deletedProductIds,
      warehouses,
    },
    // Solo sync de los actualizados
    { syncProductIds: uniqueIds },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

