import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { CategoryTableDiscountBadge } from '@/components/category/category-table-pricing';
import { CategoryTablePurchaseCell } from '@/components/category/category-table-purchase-cell';
import { CategoryTableRolePricing } from '@/components/category/category-table-role-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import {
  useAdminInventoryCatalogMap,
  type AdminCatalogInventoryEntry,
} from '@/hooks/use-admin-inventory-price-map';
import { useInventoryMutations } from '@/hooks/use-products';
import {
  countCategoryTableColumns,
  getCategoryTableVisiblePriceRoles,
} from '@/lib/category-table-price-columns';
import { createEmptyInventoryProduct } from '@/lib/inventory-product';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import {
  getProductTableSpecDisplay,
  PRODUCT_TABLE_SPEC_COLUMNS,
  type ProductTableSpecColumnId,
} from '@/lib/product-table-spec-columns';
import {
  ensureFullPrices,
  PRICE_ROLE_LABELS,
  resolvePriceRole,
  type PriceRole,
  type ProductRolePrices,
} from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';

function resolveTableRolePrices(
  product: Product,
  catalogEntry: AdminCatalogInventoryEntry | undefined,
): ProductRolePrices {
  return (
    catalogEntry?.prices ??
    product.prices ??
    ensureFullPrices({ public: product.price })
  );
}

interface CategoryProductsTableProps {
  products: Product[];
  /** Categoría preseleccionada al crear producto (solo administrador). */
  defaultCategory?: string | null;
}

const tableHeadClass =
  'h-8 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground';

const tableCellClass = 'px-2 py-1.5 align-middle';

const rolePriceHeadClass = cn(tableHeadClass, 'min-w-[5.5rem] text-right');

const rolePriceCellClass = cn(tableCellClass, 'text-right');

const specHeadClass = cn(
  tableHeadClass,
  'hidden min-w-[5.5rem] text-left lg:table-cell',
);

const specCellClass = cn(
  tableCellClass,
  'hidden text-left text-[0.65rem] leading-tight text-muted-foreground lg:table-cell',
);

const SPEC_COLUMN_MIN_WIDTH: Partial<Record<ProductTableSpecColumnId, string>> = {
  produccion: 'min-w-[8.5rem]',
  anio: 'min-w-[5rem]',
};

function ProductTableSpecCell({
  product,
  columnId,
}: {
  product: Product;
  columnId: ProductTableSpecColumnId;
}) {
  const value = getProductTableSpecDisplay(product, columnId);
  return (
    <span className="line-clamp-2 text-pretty leading-tight" title={value === '—' ? undefined : value}>
      {value}
    </span>
  );
}

export function CategoryProductsTable({
  products,
  defaultCategory = null,
}: CategoryProductsTableProps) {
  const { isAdmin, role } = useAuth();
  const catalogMap = useAdminInventoryCatalogMap();
  const visiblePriceRoles = useMemo(
    () => getCategoryTableVisiblePriceRoles(isAdmin, role),
    [isAdmin, role],
  );
  const discountPriceRole: PriceRole = isAdmin ? 'public' : resolvePriceRole(role);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const { deleteProduct } = useInventoryMutations();

  const tableMinWidth = isAdmin ? '96rem' : '52rem';

  const openCreate = useCallback(() => {
    const empty = createEmptyInventoryProduct();
    if (defaultCategory?.trim()) {
      empty.category = defaultCategory.trim();
    }
    setEditingProduct(empty);
    setDialogOpen(true);
  }, [defaultCategory]);

  const openEdit = useCallback((inventory: InventoryProduct) => {
    setEditingProduct(inventory);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingProduct(null);
  }, []);

  const handleDelete = useCallback(
    async (inventory: InventoryProduct) => {
      if (!window.confirm(`¿Eliminar «${inventory.name}» del inventario?`)) return;
      await deleteProduct.mutateAsync(inventory.id);
    },
    [deleteProduct],
  );

  return (
    <div className="space-y-3">
      {isAdmin ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            className="min-h-10 gap-1.5 bg-red-600 font-semibold hover:bg-red-500"
            onClick={openCreate}
          >
            <Plus className="size-4" aria-hidden="true" />
            Añadir producto
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table className="border-collapse" style={{ minWidth: tableMinWidth }}>
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead
                scope="col"
                className={cn(tableHeadClass, 'hidden min-w-[9rem] text-left md:table-cell')}
              >
                Categoría
              </TableHead>
            <TableHead scope="col" className={cn(tableHeadClass, 'min-w-[17rem] text-left')}>
              Producto
            </TableHead>
              {PRODUCT_TABLE_SPEC_COLUMNS.map((column) => (
                <TableHead
                  key={column.id}
                  scope="col"
                  className={cn(specHeadClass, SPEC_COLUMN_MIN_WIDTH[column.id])}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead scope="col" className={cn(tableHeadClass, 'w-28 text-center')}>
                Stock
              </TableHead>
              <TableHead scope="col" className={cn(tableHeadClass, 'w-24 text-center')}>
                Descuento
              </TableHead>
              {isAdmin ? (
                <TableHead scope="col" className={rolePriceHeadClass}>
                  Compra
                </TableHead>
              ) : null}
              {visiblePriceRoles.map((priceRole) => (
                <TableHead key={priceRole} scope="col" className={rolePriceHeadClass}>
                  {PRICE_ROLE_LABELS[priceRole]}
                </TableHead>
              ))}
              <TableHead scope="col" className={cn(tableHeadClass, 'w-36 text-center')}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <CategoryProductTableRow
                key={product.id}
                product={product}
                catalogEntry={catalogMap?.get(product.id)}
                visiblePriceRoles={visiblePriceRoles}
                discountPriceRole={discountPriceRole}
                isAdmin={isAdmin}
                striped={index % 2 === 1}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {isAdmin ? (
        <InventoryProductFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          initial={editingProduct}
        />
      ) : null}
    </div>
  );
}

function CategoryProductTableRow({
  product,
  catalogEntry,
  visiblePriceRoles,
  discountPriceRole,
  isAdmin,
  striped,
  onEdit,
  onDelete,
}: {
  product: Product;
  catalogEntry: AdminCatalogInventoryEntry | undefined;
  visiblePriceRoles: readonly PriceRole[];
  discountPriceRole: PriceRole;
  isAdmin: boolean;
  striped: boolean;
  onEdit: (inventory: InventoryProduct) => void;
  onDelete: (inventory: InventoryProduct) => void;
}) {
  const outOfStock = product.stock <= 0;
  const detailHref = productPath(product.id);
  const imageUrl = resolveProductImageUrl(product);
  const rolePrices = resolveTableRolePrices(product, catalogEntry);
  const canManage = isAdmin && catalogEntry != null;
  const displayPriceUsd = product.price;

  return (
    <TableRow
      className={cn(
        'group/row border-b border-border/70 transition-colors hover:bg-muted/30',
        striped && 'bg-muted/20',
      )}
    >
      <TableCell
        className={cn(
          tableCellClass,
          'hidden text-left text-xs text-muted-foreground md:table-cell',
        )}
      >
        <span className="line-clamp-2 text-pretty leading-tight">{product.category ?? '—'}</span>
      </TableCell>
      <TableCell className={tableCellClass}>
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to={detailHref}
            className="relative block size-11 shrink-0 overflow-hidden rounded-md border border-border/70 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 sm:size-12"
            aria-label={`Ver ficha de ${product.name}`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="size-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <span
                className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground"
                aria-hidden="true"
              >
                {product.name.charAt(0)}
              </span>
            )}
          </Link>
          <Link
            to={detailHref}
            className="min-w-0 flex-1 rounded no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
          >
            <ProductCardTitle product={product} variant="table" />
          </Link>
          {canManage ? (
            <div
              className={cn(
                'flex shrink-0 items-center gap-0.5',
                'opacity-100 sm:opacity-0 sm:transition-opacity',
                'sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100',
              )}
            >
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
                aria-label={`Editar ${product.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit(catalogEntry.product);
                }}
              >
                <Pencil className="size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
                aria-label={`Eliminar ${product.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void onDelete(catalogEntry.product);
                }}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </TableCell>
      {PRODUCT_TABLE_SPEC_COLUMNS.map((column) => (
        <TableCell key={column.id} className={specCellClass}>
          <ProductTableSpecCell product={product} columnId={column.id} />
        </TableCell>
      ))}
      <TableCell className={cn(tableCellClass, 'text-center')}>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-medium tabular-nums text-foreground">
            {outOfStock ? '—' : `${product.stock} unidad${product.stock === 1 ? '' : 'es'}`}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[0.65rem] font-medium',
              outOfStock ? 'text-destructive' : 'text-green-700',
            )}
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                outOfStock ? 'bg-destructive' : 'bg-green-500',
              )}
              aria-hidden="true"
            />
            {outOfStock ? 'Sin stock' : 'En stock'}
          </span>
        </div>
      </TableCell>
      <TableCell className={cn(tableCellClass, 'text-center')}>
        <CategoryTableDiscountBadge
          productId={product.id}
          priceUsd={rolePrices[discountPriceRole]}
        />
      </TableCell>
      {isAdmin ? (
        <TableCell className={rolePriceCellClass}>
          <CategoryTablePurchaseCell
            purchasePriceUsd={catalogEntry?.purchasePriceUsd ?? 0}
          />
        </TableCell>
      ) : null}
      {visiblePriceRoles.map((priceRole) => (
        <TableCell key={priceRole} className={rolePriceCellClass}>
          <CategoryTableRolePricing priceUsd={rolePrices[priceRole]} />
        </TableCell>
      ))}
      <TableCell className={tableCellClass}>
        <div className="flex items-center justify-center gap-1.5">
          <AddToCartButton
            product={product}
            size="sm"
            className="h-8 min-w-[5rem] gap-1 rounded-md bg-red-600 px-2 text-[0.65rem] font-semibold hover:bg-red-500"
          >
            <ShoppingCart className="size-3 shrink-0" aria-hidden="true" />
            {getAddToCartLabel(product, 'short')}
          </AddToCartButton>
          <ProductWhatsAppButton
            className="size-8 shrink-0 rounded-md"
            product={{
              id: product.id,
              name: product.name,
              priceUsd: displayPriceUsd,
              category: product.category,
              brand: product.brand ?? null,
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoryProductsTableSkeleton({ rows = 8 }: { rows?: number }) {
  const { isAdmin, role } = useAuth();
  const colSpan = useMemo(
    () => countCategoryTableColumns(isAdmin, role),
    [isAdmin, role],
  );

  const minWidth = isAdmin ? '96rem' : '52rem';

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm"
      aria-hidden="true"
    >
      <Table style={{ minWidth }}>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className={index % 2 === 1 ? 'bg-muted/20' : undefined}>
              <TableCell colSpan={colSpan} className="px-2 py-1.5">
                <div className="h-10 animate-pulse rounded-md border border-border/60 bg-muted" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
