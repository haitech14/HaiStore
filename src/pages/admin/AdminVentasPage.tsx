import { ArrowLeft, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { AdminModuleLayout } from '@/components/admin/admin-module-layout';
import { SalesUnifiedListPanel } from '@/components/admin/sales/sales-unified-list-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';
import { Button } from '@/components/ui/button';
import { useAdminOrdersList } from '@/hooks/use-admin-orders';
import { useAdminProformas } from '@/hooks/use-admin-proformas';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

function isTpvView(searchParams: URLSearchParams) {
  return searchParams.get('vista') === 'tpv' || searchParams.get('nuevo') === '1';
}

export function AdminVentasPage() {
  const [searchParams] = useSearchParams();
  const showTpv = isTpvView(searchParams);
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrdersList();
  const { data: proformas = [], isLoading: proformasLoading } = useAdminProformas();

  const isLoading = ordersLoading || proformasLoading;
  const totalCount = orders.length + proformas.length;

  if (showTpv) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="min-h-11 gap-2" asChild>
            <Link to={ADMIN_ROUTES.VENTAS}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al listado
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Punto de venta — emite cotización, factura o boleta en PDF. Las cotizaciones quedan
            registradas para seguimiento.
          </p>
        </div>
        <TpvPanel />
      </div>
    );
  }

  return (
    <AdminModuleLayout
      title="Ventas"
      description="Ventas registradas y cotizaciones para seguimiento comercial con clientes."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Cargando registros…'
            : `${totalCount} registro${totalCount === 1 ? '' : 's'} (${orders.length} venta${orders.length === 1 ? '' : 's'}, ${proformas.length} cotización${proformas.length === 1 ? '' : 'es'})`}
        </p>
        <Button
          asChild
          className="min-h-11 gap-2 bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
        >
          <Link to={ADMIN_ROUTES.TPV}>
            <Plus className="size-4" aria-hidden="true" />
            Nueva cotización (TPV)
          </Link>
        </Button>
      </div>

      <SalesUnifiedListPanel orders={orders} proformas={proformas} isLoading={isLoading} />
    </AdminModuleLayout>
  );
}
