import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { ProductCatalogCard } from '@/components/product/product-catalog-card';
import { SubcategoriesGrid } from '@/components/subcategories-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { findCategoryBySlug, resolveCategoryPageProductLabels } from '@/lib/category-product-labels';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useProducts } from '@/hooks/use-products';
import { categoryPath, categoryLandingPath } from '@/lib/category-path';
import { catalogGridClassName } from '@/lib/category-grid-layout';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { isPrinterEquipmentProduct } from '@/lib/product-condition';
import { findStoreCategoryBySlug } from '@/lib/store-category-display';

const PREVIEW_PRODUCT_LIMIT = 8;

interface CategoryStripPreviewProps {
  categorySlug: string;
  activeSubSlug: string | null;
  onSelectSub: (subSlug: string | null) => void;
}

export function CategoryStripPreview({
  categorySlug,
  activeSubSlug,
  onSelectSub,
}: CategoryStripPreviewProps) {
  const category = findCategoryBySlug(categorySlug);
  const { data: categoryTreeData, isLoading: treeLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;
  const { data: products, isLoading: productsLoading, isError } = useProducts();

  const storeCategory = useMemo(
    () => findStoreCategoryBySlug(categoryTree, categorySlug),
    [categoryTree, categorySlug],
  );

  const productLabels = useMemo(() => {
    if (!category) return [];
    return resolveCategoryPageProductLabels(category, storeCategory, activeSubSlug);
  }, [category, storeCategory, activeSubSlug]);

  const filteredProducts = useMemo(() => {
    if (!products?.length || !category) return [];

    return products
      .filter((product) => {
        if (categorySlug === 'repuestos' && isPrinterEquipmentProduct(product)) {
          return false;
        }
        return productLabels.some((label) => productMatchesCategoryFilter(product, label));
      })
      .sort((a, b) => {
        const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name, 'es');
      });
  }, [products, category, categorySlug, productLabels]);

  const previewProducts = filteredProducts.slice(0, PREVIEW_PRODUCT_LIMIT);
  const subcategories = storeCategory?.children ?? [];
  const isLoading = treeLoading || productsLoading;
  const viewAllHref = activeSubSlug
    ? categoryPath(categorySlug, activeSubSlug)
    : categoryLandingPath(categorySlug);

  if (!category) return null;

  if (categorySlug === 'servicio-tecnico') {
    return (
      <div className="mt-8 rounded-xl border border-border/70 bg-muted/20 px-5 py-8 text-center sm:px-8">
        <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{category.tagline}</p>
        <Button asChild className="mt-5 min-h-11 bg-red-600 hover:bg-red-500">
          <Link to="/contacto?tema=servicio">
            Solicitar servicio técnico
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6 border-t border-border/60 pt-8">
      {subcategories.length > 0 ? (
        <SubcategoriesGrid
          parentSlug={categorySlug}
          parentImage={storeCategory?.image ?? category.image ?? null}
          subcategories={subcategories}
          activeSubSlug={activeSubSlug}
          products={products ?? []}
          onSelectSub={onSelectSub}
        />
      ) : null}

      {isError ? (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
        </p>
      ) : isLoading ? (
        <div className={catalogGridClassName(5)}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border/60 p-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : previewProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="font-medium text-foreground">
            No hay productos en esta categoría por ahora.
          </p>
          <Button asChild variant="link" className="mt-2 text-red-600">
            <Link to="/tienda">Explorar todo el catálogo</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className={catalogGridClassName(5)} role="list">
            {previewProducts.map((product) => (
              <li key={product.id}>
                <ProductCatalogCard product={product} />
              </li>
            ))}
          </ul>

          {filteredProducts.length > PREVIEW_PRODUCT_LIMIT ? (
            <div className="flex justify-center pt-2">
              <Button asChild className="min-h-11 gap-1.5 bg-red-600 hover:bg-red-500">
                <Link to={viewAllHref}>
                  Ver {filteredProducts.length - PREVIEW_PRODUCT_LIMIT} productos más
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
