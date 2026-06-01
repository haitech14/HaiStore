import { useMemo } from 'react';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import { FEATURED_PRODUCT_IDS, type FeaturedProduct } from '@/data/featured-products';
import { useProducts } from '@/hooks/use-products';
import { resolveStoreFeaturedProducts } from '@/lib/store-products';

function useFeaturedFromStore(): FeaturedProduct[] {
  const { data: storeProducts } = useProducts();

  return useMemo(() => {
    if (!storeProducts?.length) return [];
    return resolveStoreFeaturedProducts(storeProducts, FEATURED_PRODUCT_IDS);
  }, [storeProducts]);
}

export function FeaturedProducts() {
  const products = useFeaturedFromStore();

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductCarouselSection
      sectionId="productos-destacados"
      title="Productos destacados"
      subtitle="Descubre nuestros productos más populares con ofertas exclusivas"
      products={products}
      viewAllHref="/tienda"
      viewAllLabel="Ver todos los productos"
    />
  );
}
