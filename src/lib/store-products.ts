import type { FeaturedProduct } from '@/data/featured-products';
import { pickRandomMostViewedProducts } from '@/lib/product-views';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { compareProductsBySortOrder } from '@/lib/inventory-product-order';
import type { CatalogFamilySlug } from '@/lib/product-condition';
import {
  productMatchesCatalogFamily,
  productMatchesCondition,
  type ProductCondition,
} from '@/lib/product-condition';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import type { Product } from '@/types/product';

export const FEATURED_CAROUSEL_LIMIT = 8;

export function productToFeatured(product: Product): FeaturedProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    ...(product.attributes?.length ? { attributes: product.attributes } : {}),
    price: product.price,
    image: resolveProductImageUrl(product),
    rating: 5,
    reviews: 0,
  };
}

export function filterStoreProductsByCategories(
  products: Product[],
  categoryLabels: readonly string[],
  limit = 10,
): FeaturedProduct[] {
  return [...products]
    .filter((product) =>
      categoryLabels.some((label) => productMatchesCategoryFilter(product, label)),
    )
    .sort(compareProductsBySortOrder)
    .slice(0, limit)
    .map(productToFeatured);
}

export function filterStoreProductsForHomeSection(
  products: Product[],
  family: CatalogFamilySlug,
  categoryLabels: readonly string[],
  condition: ProductCondition,
  limit = 10,
): FeaturedProduct[] {
  return [...products]
    .filter((product) => {
      const inFamily =
        productMatchesCatalogFamily(product, family) ||
        categoryLabels.some((label) => productMatchesCategoryFilter(product, label));
      return inFamily && productMatchesCondition(product, condition);
    })
    .sort(compareProductsBySortOrder)
    .slice(0, limit)
    .map(productToFeatured);
}

export function pickFeaturedByIds(
  products: Product[],
  orderedIds: readonly string[],
): FeaturedProduct[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return orderedIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product != null)
    .map(productToFeatured);
}

function pickFeaturedByFlag(products: Product[], limit: number): FeaturedProduct[] {
  return [...products]
    .filter((product) => product.is_featured === true)
    .sort(compareProductsBySortOrder)
    .slice(0, limit)
    .map(productToFeatured);
}

/** Destacados del inicio: manual → ids configurados → aleatorio entre más vistos. */
export function resolveStoreFeaturedProducts(
  products: Product[],
  featuredIds: readonly string[],
  limit = FEATURED_CAROUSEL_LIMIT,
): FeaturedProduct[] {
  if (!products.length) return [];

  const flagged = pickFeaturedByFlag(products, limit);
  if (flagged.length > 0) return flagged;

  const byIds = pickFeaturedByIds(products, featuredIds);
  if (byIds.length > 0) return byIds.slice(0, limit);

  return pickRandomMostViewedProducts(products, limit).map(productToFeatured);
}
