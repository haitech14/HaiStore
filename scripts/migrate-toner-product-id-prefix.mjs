import 'dotenv/config';

import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

/**
 * Quita el prefijo «toner-» de ids de producto (p. ej. toner-419078 → 419078,
 * toner-compat-foo → compat-foo).
 * @param {string} id
 */
function stripTonerIdPrefix(id) {
  const value = String(id ?? '').trim();
  if (value.startsWith('toner-compat-')) {
    return value.slice('toner-'.length);
  }
  if (value.startsWith('toner-')) {
    return value.slice('toner-'.length);
  }
  return value;
}

function remapIdList(ids, idMap) {
  if (!Array.isArray(ids)) return ids;
  const seen = new Set();
  const result = [];
  for (const entry of ids) {
    if (typeof entry !== 'string') continue;
    const next = idMap.get(entry) ?? entry;
    if (!next || seen.has(next)) continue;
    seen.add(next);
    result.push(next);
  }
  return result;
}

function remapProductReferences(product, idMap) {
  const next = { ...product };

  if (Array.isArray(next.cross_sell_product_ids)) {
    next.cross_sell_product_ids = remapIdList(next.cross_sell_product_ids, idMap);
  }
  if (Array.isArray(next.upsell_product_ids)) {
    next.upsell_product_ids = remapIdList(next.upsell_product_ids, idMap);
  }
  if (Array.isArray(next.bundle_components)) {
    next.bundle_components = next.bundle_components.map((component) => {
      if (!component || typeof component !== 'object') return component;
      const productId = component.product_id ?? component.productId;
      if (typeof productId !== 'string') return component;
      const mapped = idMap.get(productId) ?? productId;
      return { ...component, product_id: mapped, productId: mapped };
    });
  }

  return next;
}

async function main() {
  const inventory = await readInventory();
  const idMap = new Map();

  for (const product of inventory.products) {
    const oldId = String(product.id ?? '').trim();
    if (!oldId.startsWith('toner-')) continue;
    const newId = stripTonerIdPrefix(oldId);
    if (!newId || newId === oldId) continue;
    idMap.set(oldId, newId);
  }

  if (idMap.size === 0) {
    console.log('No hay productos con prefijo toner- que migrar.');
    return;
  }

  const renamingFrom = new Set(idMap.keys());
  const collisions = [];
  for (const [oldId, newId] of idMap) {
    const occupant = inventory.products.find((product) => product.id === newId);
    if (occupant && !renamingFrom.has(occupant.id)) {
      collisions.push(`${oldId} → ${newId} (ocupado por ${occupant.id})`);
    }
  }
  if (collisions.length > 0) {
    throw new Error(`Colisión de ids al migrar: ${collisions.join(', ')}`);
  }

  const migratedProducts = inventory.products.map((product) => {
    const oldId = product.id;
    const newId = idMap.get(oldId);
    const withRefs = remapProductReferences(product, idMap);
    if (!newId) return withRefs;
    return { ...withRefs, id: newId };
  });

  const deletedProductIds = (inventory.deletedProductIds ?? []).map(
    (id) => idMap.get(id) ?? id,
  );

  await writeInventory({
    products: migratedProducts,
    deletedProductIds: [...new Set(deletedProductIds)],
    warehouses: inventory.warehouses,
  });

  console.log(`Migrados ${idMap.size} ids (toner-* → sin prefijo toner-).`);
  console.log('Ejemplos:');
  for (const [oldId, newId] of [...idMap.entries()].slice(0, 5)) {
    console.log(`  ${oldId} → ${newId}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
