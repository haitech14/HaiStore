/**
 * Exporta imágenes data: del inventario a public/products y sincroniza Supabase.
 * Uso: node scripts/sync-product-images.mjs
 */
import 'dotenv/config';

import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { persistProductsMedia } from '../server/lib/persist-product-media.js';
import { syncProductsToSupabase } from '../server/lib/product-catalog.js';

const inventory = await readInventory();
const before = inventory.products.filter((p) =>
  String(p.image_url ?? '').startsWith('data:'),
).length;

console.log(`Productos en inventario: ${inventory.products.length} (${before} con data: URL)`);

const persisted = await persistProductsMedia(inventory.products);
await writeInventory({
  products: persisted,
  deletedProductIds: inventory.deletedProductIds ?? [],
  warehouses: inventory.warehouses,
});

await syncProductsToSupabase(persisted);

const after = persisted.filter((p) => String(p.image_url ?? '').startsWith('data:')).length;
const withPublic = persisted.filter((p) =>
  String(p.image_url ?? '').startsWith('/products/'),
).length;

console.log(`Listo: ${withPublic} con /products/*.webp, ${after} aún en data: URL.`);
console.log('Haz commit de public/products/ y despliega en Vercel.');
