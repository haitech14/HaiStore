import { readInventory } from './inventory-store.js';
import { listProducts, searchPublicProducts } from './product-catalog.js';
import { listHomeCatalogBundle } from './home-catalog-bundle.js';

/** Precarga inventario, catálogo público y bundle de la landing al arrancar la API. */
export async function prewarmStorefrontCatalog() {
  await readInventory();
  await listProducts({ role: 'public' });
  await searchPublicProducts({ query: 'ricoh', role: 'public', limit: 5 });
  await listHomeCatalogBundle();
}
