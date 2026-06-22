import { ProductDetailCombo } from '@/components/product-detail/product-detail-combo';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailGalleryComboProps {
  product: Product;
  items: ProductComboItem[];
  catalogProducts?: Product[];
  loading?: boolean;
  onViewAll?: () => void;
}

export function ProductDetailGalleryCombo({
  product,
  items,
  catalogProducts = [],
  loading = false,
  onViewAll,
}: ProductDetailGalleryComboProps) {
  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-4 border-t border-border/60 pt-4" aria-labelledby="combo-ahorro-titulo">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="combo-ahorro-titulo" className="text-sm font-bold text-[#0f1f3d] sm:text-base">
          Compra en Combo y ahorra
        </h2>
        {items.length > 0 && onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Ver todos
          </button>
        ) : null}
      </div>
      {loading ? (
        <div role="status" aria-live="polite" aria-label="Cargando accesorios recomendados">
          <div className="grid gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg border border-border/40 bg-muted/50"
              />
            ))}
          </div>
        </div>
      ) : (
        <ProductDetailCombo
          items={items}
          mainProduct={product}
          catalogProducts={catalogProducts}
          title="Compra en Combo y ahorra"
          layout="complement"
          defaultCollapsed={false}
          collapsible={false}
          embedded
          hideTitle
          className="border-0 bg-transparent shadow-none"
        />
      )}
    </section>
  );
}
