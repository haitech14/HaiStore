import 'dotenv/config';

import {
  hasTonerColorCode,
  normalizeTonerColorProductName,
  TONER_COLOR_CODE_LABELS,
} from '../shared/inventory-product-name.js';
import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

const COLOR_VALUE_BY_CODE = {
  BK: 'Negro',
  CY: 'Cyan',
  MG: 'Magenta',
  YW: 'Amarillo',
};

function syncColorAttribute(product, code) {
  const colorValue = COLOR_VALUE_BY_CODE[code];
  if (!colorValue) return product.attributes ?? [];

  const attributes = Array.isArray(product.attributes) ? [...product.attributes] : [];
  const colorIndex = attributes.findIndex(
    (entry) => entry && String(entry.name ?? '').trim().toLowerCase() === 'color',
  );

  if (colorIndex >= 0) {
    attributes[colorIndex] = { ...attributes[colorIndex], value: colorValue };
    return attributes;
  }

  return [...attributes, { name: 'Color', value: colorValue }];
}

function detectColorCode(name) {
  const match = String(name ?? '').match(/\b(BK|CY|MG|YW)\b/i);
  return match ? match[1].toUpperCase() : null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const inventory = await readInventory();
  let updated = 0;

  const products = inventory.products.map((product) => {
    if (!hasTonerColorCode(product.name)) return product;

    const code = detectColorCode(product.name);
    const nextName = normalizeTonerColorProductName(product.name);
    if (nextName === product.name) return product;

    updated += 1;
    console.log(`• ${product.id}\n  ${product.name}\n  → ${nextName}\n`);

    return {
      ...product,
      name: nextName,
      attributes: code ? syncColorAttribute(product, code) : product.attributes,
    };
  });

  console.log(`\nProductos con códigos BK/CY/MG/YW: ${updated}`);
  console.log('Sufijos:', Object.entries(TONER_COLOR_CODE_LABELS).map(([k, v]) => `${k}→${v}`).join(', '));

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (updated === 0) {
    console.log('\nNada que actualizar.');
    return;
  }

  const syncProductIds = products
    .filter((product, index) => product.name !== inventory.products[index]?.name)
    .map((product) => product.id);

  await writeInventory(
    {
      products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    },
    { syncProductIds },
  );

  console.log(`\nInventario actualizado (${updated} productos).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
