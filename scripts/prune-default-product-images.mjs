#!/usr/bin/env node
/**
 * Elimina imágenes por defecto del inventario local:
 * - placeholders de categoría/promo
 * - rutas /products/ tomadas de otro producto
 * - imágenes genéricas por modelo mal asignadas
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { sanitizeStoredProductMedia } from '../shared/product-media-sanitize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inventoryPath = join(__dirname, '..', 'server', 'data', 'inventory.json');

const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
let clearedProducts = 0;
let removedUrls = 0;

const products = inventory.products.map((product) => {
  const beforeUrls = [
    product.image_url,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ].filter(Boolean);

  const media = sanitizeStoredProductMedia(product);
  const afterUrls = [media.image_url, ...media.gallery].filter(Boolean);

  if (beforeUrls.length !== afterUrls.length) {
    clearedProducts += 1;
    removedUrls += beforeUrls.length - afterUrls.length;
  }

  return {
    ...product,
    image_url: media.image_url,
    gallery: media.gallery,
  };
});

writeFileSync(inventoryPath, `${JSON.stringify({ ...inventory, products }, null, 2)}\n`, 'utf8');

const withImage = products.filter((product) => product.image_url || product.gallery?.length).length;

console.log(
  JSON.stringify(
    {
      totalProducts: products.length,
      productsWithAuthenticImage: withImage,
      productsCleared: clearedProducts,
      urlsRemoved: removedUrls,
      inventoryPath,
    },
    null,
    2,
  ),
);
