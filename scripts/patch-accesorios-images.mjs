import 'dotenv/config';

import { ACCESORIOS_DEFAULT_IMAGE } from '../server/lib/ricoh-lp-web-excel.js';
import {
  ensureProductSortOrders,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { readStoreCategories, updateStoreCategory } from '../server/lib/store-categories-store.js';

const LEGACY_IMAGE = '/categories/toner-suministros.png';

function shouldUseAccesoriosPlaceholder(product) {
  const imageUrl = String(product.image_url ?? '').trim();
  if (!imageUrl || imageUrl === LEGACY_IMAGE || imageUrl === ACCESORIOS_DEFAULT_IMAGE) {
    return imageUrl !== ACCESORIOS_DEFAULT_IMAGE;
  }
  if (imageUrl.startsWith('/products/')) {
    return false;
  }
  return imageUrl.includes('toner-suministros');
}

async function main() {
  const inventory = await readInventory();
  let updated = 0;

  const products = inventory.products.map((product) => {
    if (product.category !== 'Accesorios' || !shouldUseAccesoriosPlaceholder(product)) {
      return product;
    }

    updated += 1;
    return {
      ...product,
      image_url: ACCESORIOS_DEFAULT_IMAGE,
      gallery: [ACCESORIOS_DEFAULT_IMAGE],
    };
  });

  const categories = await readStoreCategories();
  const accCat = categories.find((row) => row.id === 'cat-toner-accesorios');
  if (accCat && accCat.image !== ACCESORIOS_DEFAULT_IMAGE) {
    await updateStoreCategory('cat-toner-accesorios', { image: ACCESORIOS_DEFAULT_IMAGE });
    console.log('Subcategoría Accesorios: imagen de categoría actualizada.');
  }

  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Imagen de accesorios actualizada en ${updated} productos → ${ACCESORIOS_DEFAULT_IMAGE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
