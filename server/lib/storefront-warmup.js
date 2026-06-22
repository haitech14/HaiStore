import { readInventory } from './inventory-store.js';
import { listProducts } from './product-catalog.js';
import { listHomeCatalogBundle } from './home-catalog-bundle.js';

/** Precarga inventario, catálogo público y bundle de la landing al arrancar la API. */
export async function prewarmStorefrontCatalog() {
  await readInventory();
  await listProducts({ role: 'public' });
  await listHomeCatalogBundle();
}
