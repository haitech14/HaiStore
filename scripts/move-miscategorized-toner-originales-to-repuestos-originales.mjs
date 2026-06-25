import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { LANDING_CATEGORY, landingInventoryCategory } from '../shared/landing-categories.js';

const TONER_ORIG_CATEGORY = landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerOriginal);
const REPUESTOS_ORIG_CATEGORY = landingInventoryCategory(
  LANDING_CATEGORY.repuestos,
  LANDING_CATEGORY.repuestosOriginales,
);

function haystackOf(product) {
  return `${product.category ?? ''} ${product.name ?? ''} ${product.description ?? ''} ${product.code ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function nameContainsTonerCartuchoOriginal(product) {
  const name = String(product?.name ?? '');
  return /toner\s+cartucho\s+original/i.test(name);
}

function isPartOrSpare(product) {
  const h = haystackOf(product);
  return (
    h.includes('repuesto') ||
    h.includes('partes') ||
    h.includes('unidad de imagen') ||
    h.includes('drum') ||
    h.includes('tambor') ||
    h.includes('fusor') ||
    h.includes('fuser') ||
    h.includes('rodillo') ||
    h.includes('maintenance kit') ||
    h.includes('kit de mantenimiento') ||
    h.includes('waste toner') ||
    h.includes('waste bottle') ||
    /\bpcu\b/.test(h) ||
    /\bpcdu\b/.test(h) ||
    /\bdev(elope(r)?)?\b/.test(h)
  );
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { products, deletedProductIds, warehouses } = await readInventory();

  const nextProducts = products.map((p) => ({ ...p }));
  const movedIds = [];

  let inspected = 0;
  let movedToRepuestos = 0;
  let movedToToner = 0;

  for (const product of nextProducts) {
    const category = String(product.category ?? '').trim();
    const shouldBeToner = nameContainsTonerCartuchoOriginal(product);

    // Si contiene "Toner Cartucho Original", forzar a Toner Originales.
    if (shouldBeToner && category !== TONER_ORIG_CATEGORY) {
      product.category = TONER_ORIG_CATEGORY;
      movedToToner += 1;
      if (product.id) movedIds.push(product.id);
      continue;
    }

    // Si NO contiene, y está en Toner Originales, mover a Repuestos Originales.
    if (!shouldBeToner && category === TONER_ORIG_CATEGORY) {
      inspected += 1;
      product.category = REPUESTOS_ORIG_CATEGORY;
      movedToRepuestos += 1;
      if (product.id) movedIds.push(product.id);
    }
  }

  console.log(`Categoría origen: ${TONER_ORIG_CATEGORY}`);
  console.log(`Inspeccionados en Toner Originales (no coinciden): ${inspected}`);
  console.log(`Movidos a Toner Originales (sí contienen): ${movedToToner}`);
  console.log(`Movidos a Repuestos Originales (no contienen): ${movedToRepuestos}`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (movedIds.length === 0) {
    console.log('\nSin cambios que escribir.');
    return;
  }

  await writeInventory(
    { products: nextProducts, deletedProductIds, warehouses },
    { syncProductIds: movedIds },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

