import { Link } from 'react-router-dom';
import { CalendarClock, Wrench } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Button } from '@/components/ui/button';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

export function ServicesPanel() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border bg-card p-4">
          <div className="flex gap-3">
            <Wrench className="mt-0.5 size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Servicio técnico</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Órdenes de trabajo, visitas en campo y mantenimiento preventivo.
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <div className="flex gap-3">
            <CalendarClock
              className="mt-0.5 size-5 text-[hsl(var(--admin-accent))]"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-semibold">Agenda</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Programación de técnicos y seguimiento de SLA por cliente.
              </p>
            </div>
          </div>
        </article>
      </div>

      <AdminEmptyState
        title="Módulo de servicios"
        description="Próximamente podrás crear órdenes de servicio, asignar técnicos y registrar repuestos utilizados."
        icon={<Wrench className="size-5" aria-hidden="true" />}
      />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to={ADMIN_ROUTES.CUSTOMERS}>Ver clientes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={ADMIN_ROUTES.INVENTORY}>Ver inventario</Link>
        </Button>
      </div>
    </div>
  );
}
