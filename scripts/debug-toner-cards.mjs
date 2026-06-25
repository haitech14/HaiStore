import { readFileSync } from 'node:fs';

import { buildProductDetail } from '../src/lib/build-product-detail.ts';
import { resolveEquipmentConfigSteps } from '../src/lib/equipment-config-catalog.ts';
import {
  mergeConsumableTonerOptions,
  mergeCrossSellTonerOptions,
  resolveConfigureTonerCards,
} from '../src/lib/product-configure-toner.ts';
import { mergeMerchandisingEquipmentSteps } from '../src/lib/product-merchandising.ts';
import { resolveEquipmentConsumables } from '../src/lib/product-equipment-consumables.ts';

const raw = JSON.parse(readFileSync('server/data/inventory.json', 'utf8'));
const catalog = raw.products.map((p) => ({ ...p, price: p.prices?.public ?? 0 }));

for (const id of ['328f41ef-d935-4807-85d0-e1db5bdf73fb', 'ricoh-im-430f']) {
  const product = catalog.find((p) => p.id === id);
  const detail = buildProductDetail(product);
  const consumableGroups = resolveEquipmentConsumables(product, catalog);
  const steps = mergeMerchandisingEquipmentSteps(
    mergeCrossSellTonerOptions(
      mergeConsumableTonerOptions(
        resolveEquipmentConfigSteps(detail.equipmentConfigSteps, catalog, product),
        consumableGroups,
      ),
      product,
      catalog,
    ),
    product,
    catalog,
  );
  const tonerStep = steps.find((s) => s.id === 'toner');
  const cards = resolveConfigureTonerCards(tonerStep, consumableGroups, '/x.png', catalog, product);
  console.log(
    id,
    cards.length ? cards.map((c) => `${c.supplyType}: ${c.title} ($${c.priceUsd})`) : 'EMPTY',
  );
}
