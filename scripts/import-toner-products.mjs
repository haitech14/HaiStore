import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';
import { parseTonerProductsWorkbook } from '../server/lib/toner-products-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'PRODUCTOS-TONER.xlsx');

const filePath = process.argv[2] ?? defaultPath;

const PARENT_CATEGORY_ID = 'cat-toner';
const SUBCATEGORIES = [
  {
    id: 'cat-toner-general',
    name: 'Toner Original',
    slug: 'toner',
    inventoryLabels: ['Toner Original', 'Toner'],
  },
  {
    id: 'cat-toner-suministros',
    name: 'Suministros',
    slug: 'suministros',
    inventoryLabels: ['Suministros'],
  },
];

async function ensureTonerSubcategories() {
  let categories = await readStoreCategories();
  const parent = categories.find((row) => row.id === PARENT_CATEGORY_ID);
  if (!parent) {
    throw new Error('No se encontró la categoría padre «Suministros» (cat-toner).');
  }

  const parentLabels = new Set(parent.inventoryLabels ?? []);
  parentLabels.add('Suministros');
  parentLabels.add('Toner y suministros');
  parentLabels.add('Tóner y Suministros');

  const parentIndex = categories.findIndex((row) => row.id === PARENT_CATEGORY_ID);
  categories[parentIndex] = {
    ...parent,
    inventoryLabels: [...parentLabels],
  };

  for (const [index, spec] of SUBCATEGORIES.entries()) {
    const existing = categories.find((row) => row.id === spec.id);
    if (existing) {
      const labels = new Set([...(existing.inventoryLabels ?? []), ...spec.inventoryLabels]);
      await updateStoreCategory(spec.id, {
        name: spec.name,
        slug: spec.slug,
        parentId: PARENT_CATEGORY_ID,
        sortOrder: index,
        inventoryLabels: [...labels],
      });
      continue;
    }

    const duplicateSlug = categories.find((row) => row.slug === spec.slug && row.id !== spec.id);
    if (duplicateSlug) {
      const labels = new Set([...(duplicateSlug.inventoryLabels ?? []), ...spec.inventoryLabels]);
      await updateStoreCategory(duplicateSlug.id, {
        parentId: PARENT_CATEGORY_ID,
        sortOrder: index,
        inventoryLabels: [...labels],
      });
      continue;
    }

    await createStoreCategory({
      id: spec.id,
      name: spec.name,
      slug: spec.slug,
      parentId: PARENT_CATEGORY_ID,
      sortOrder: index,
      inventoryLabels: spec.inventoryLabels,
      image: '/categories/toner-suministros.png',
      tagline:
        spec.id === 'cat-toner-general'
          ? 'Tóner y cartuchos originales Ricoh'
          : spec.id === 'cat-toner-suministros'
            ? 'Grapas, kits y suministros Ricoh'
            : 'Tóner compatibles y suministros relacionados',
    });
  }

  categories = await readStoreCategories();
  return categories;
}

function mergeByCode(existing, incoming) {
  const byCode = new Map(
    existing.map((product) => [String(product.code ?? '').trim().toLowerCase(), product]),
  );

  let created = 0;
  let updated = 0;

  for (const product of incoming) {
    const key = String(product.code ?? '').trim().toLowerCase();
    const prev = byCode.get(key);

    if (prev) {
      byCode.set(
        key,
        normalizeProductInput(
          {
            ...product,
            id: prev.id,
            sort_order: prev.sort_order,
            stock: prev.stock,
            stock_by_warehouse: prev.stock_by_warehouse,
            gallery: prev.gallery?.length ? prev.gallery : product.gallery,
            image_url: prev.image_url ?? product.image_url,
            view_count: prev.view_count,
            created_at: prev.created_at,
          },
          prev,
        ),
      );
      updated += 1;
    } else {
      byCode.set(key, product);
      created += 1;
    }
  }

  return {
    products: [...byCode.values()],
    created,
    updated,
  };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'PRODUCTOS-TONER.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const buffer = readFileSync(filePath);
  const imported = parseTonerProductsWorkbook(buffer);

  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel.');
    process.exit(1);
  }

  const byCategory = imported.reduce((acc, product) => {
    const key = product.category ?? 'Sin categoría';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Productos en Excel: ${imported.length}`);
  console.log('Por categoría:', byCategory);

  await ensureTonerSubcategories();
  console.log(
    'Subcategorías «Toner Original» y «Suministros» listas bajo Suministros.',
  );

  const inventory = await readInventory();
  const codesBefore = new Set(
    inventory.products.map((p) => String(p.code ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const { products: mergedProducts, created, updated } = mergeByCode(inventory.products, imported);
  const actuallyCreated = imported.filter(
    (p) => !codesBefore.has(String(p.code ?? '').trim().toLowerCase()),
  ).length;
  const actuallyUpdated = imported.length - actuallyCreated;

  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(
    `Inventario actualizado: ${actuallyCreated} nuevos, ${actuallyUpdated} actualizados por código (${created}/${updated} en merge).`,
  );
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
