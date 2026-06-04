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
import { parseRepuestosProductsWorkbook } from '../server/lib/repuestos-products-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'Repuestos-Lista.xlsx');

const filePath = process.argv[2] ?? defaultPath;

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
  const seedCopy = join(seedsDir, 'Repuestos-Lista.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const buffer = readFileSync(filePath);
  const imported = parseRepuestosProductsWorkbook(buffer);

  if (imported.length === 0) {
    console.error('No se encontraron repuestos válidos en el Excel.');
    process.exit(1);
  }

  const entries = imported.length;
  console.log(`Repuestos únicos (códigos fusionados): ${entries}`);
  const mergedSample = imported.find((p) => p.description?.includes(' · '));
  console.log('Muestra de títulos fusionados:');
  for (const sample of imported.slice(0, 2)) {
    console.log(`  [${sample.code}] ${sample.name}`);
  }
  if (mergedSample) {
    console.log('Muestra con modelos concatenados:');
    console.log(`  [${mergedSample.code}] ${mergedSample.description}`);
  }

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

  const repuestosCount = products.filter((p) => p.category === 'Repuestos').length;
  console.log(`Productos categoría Repuestos: ${repuestosCount}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
