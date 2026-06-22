import { useState } from 'react';
import { Pencil } from 'lucide-react';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { ProductDetailBreadcrumbs } from '@/components/product-detail/product-detail-breadcrumbs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useAdminInventoryCatalogMap } from '@/hooks/use-admin-inventory-price-map';
import { cn } from '@/lib/utils';
import type { ProductBreadcrumb } from '@/types/product-detail';

interface ProductDetailBreadcrumbsBarProps {
  items: ProductBreadcrumb[];
  productId: string;
  className?: string;
}

export function ProductDetailBreadcrumbsBar({
  items,
  productId,
  className,
}: ProductDetailBreadcrumbsBarProps) {
  const { isAdmin } = useAuth();
  const catalogMap = useAdminInventoryCatalogMap();
  const catalogEntry = catalogMap?.get(productId) ?? null;
  const inventoryProduct = catalogEntry?.product ?? null;
  const [editOpen, setEditOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <div className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2', className)}>
        <ProductDetailBreadcrumbs items={items} className="mb-0 min-w-0 flex-1" />
        {isAdmin && inventoryProduct ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 border-border text-foreground hover:bg-muted/50 focus-visible:ring-red-600"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar producto
          </Button>
        ) : null}
      </div>

      {isAdmin && inventoryProduct ? (
        <InventoryProductFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={inventoryProduct}
        />
      ) : null}
    </>
  );
}
