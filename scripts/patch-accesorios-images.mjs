import 'dotenv/config';

import { sanitizeStoredProductMedia } from '../shared/product-media-sanitize.js';
import {
  ensureProductSortOrders,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';

async function main() {
  const inventory = await readInventory();
  let updated = 0;

  const products = inventory.products.map((product) => {
    if (product.category !== 'Accesorios') {
      return product;
    }

    const media = sanitizeStoredProductMedia(product);
    const hadMedia = Boolean(product.image_url) || (product.gallery?.length ?? 0) > 0;
    const hasMedia = Boolean(media.image_url) || media.gallery.length > 0;

    if (hadMedia && !hasMedia) {
      updated += 1;
    } else if (
      product.image_url !== media.image_url ||
      JSON.stringify(product.gallery ?? []) !== JSON.stringify(media.gallery)
    ) {
      updated += 1;
    }

    return {
      ...product,
      image_url: media.image_url,
      gallery: media.gallery,
    };
  });

  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Accesorios sin imagen por defecto: ${updated} producto(s) actualizado(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
