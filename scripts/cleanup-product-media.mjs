/**
 * Elimina placeholders negros y segundas imágenes de galería en inventario.
 * Ejecutar: node scripts/cleanup-product-media.mjs
 */
import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

const { products, deletedProductIds, warehouses } = await readInventory();
await writeInventory({ products, deletedProductIds, warehouses });
console.log(`Medios de producto saneados en ${products.length} filas.`);
