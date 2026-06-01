import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, Tags, Wrench } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { NewServiceDialog } from '@/components/admin/services/new-service-dialog';

const ServicesPriceListPanel = lazy(() =>
  import('@/components/admin/services/services-price-list-panel').then((m) => ({
    default: m.ServicesPriceListPanel,
  })),
);
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  deleteServiceOrder,
  loadServiceCategories,
  loadServiceOrders,
  loadServicePriceList,
  updateServiceCategory,
  updateServiceOrderStatus,
} from '@/lib/services-storage';
import { cn } from '@/lib/utils';
import type { ServiceCategory, ServiceOrder, ServiceOrderStatus } from '@/types/service';

export type ServicesTab = 'servicios' | 'categorias' | 'precios';

const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_VARIANT: Record<
  ServiceOrderStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  scheduled: 'default',
  in_progress: 'default',
  completed: 'outline',
  cancelled: 'destructive',
};

const NEXT_STATUS: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  pending: 'scheduled',
  scheduled: 'in_progress',
  in_progress: 'completed',
};

export function parseServicesTab(searchParams: URLSearchParams): ServicesTab {
  const tab = searchParams.get('tab');
  if (tab === 'categorias' || tab === 'precios') return tab;
  return 'servicios';
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAgendaDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function ServicesPanel() {
  const [searchParams] = useSearchParams();
  const tab = parseServicesTab(searchParams);
  const [orders, setOrders] = useState<ServiceOrder[]>(() => loadServiceOrders());
  const [categories, setCategories] = useState<ServiceCategory[]>(() => loadServiceCategories());
  const [priceList, setPriceList] = useState(() => loadServicePriceList());
  const [newOpen, setNewOpen] = useState(false);
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? id;
  }, [categories]);

  const agendaOrders = useMemo(
    () =>
      [...orders]
        .filter((o) => o.status !== 'cancelled' && o.status !== 'completed')
        .sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        ),
    [orders],
  );

  useEffect(() => {
    if (!savedHint) return;
    const t = window.setTimeout(() => setSavedHint(null), 2500);
    return () => window.clearTimeout(t);
  }, [savedHint]);

  const advanceStatus = (id: string) => {
    const row = orders.find((o) => o.id === id);
    if (!row) return;
    const next = NEXT_STATUS[row.status];
    if (!next) return;
    setOrders(updateServiceOrderStatus(id, next));
    setSavedHint('Estado actualizado.');
  };

  const handleDelete = (id: string, code: string) => {
    if (!window.confirm(`¿Eliminar el servicio ${code}?`)) return;
    setOrders(deleteServiceOrder(id));
    setSavedHint('Servicio eliminado.');
  };

  const toggleCategory = (id: string) => {
    const row = categories.find((c) => c.id === id);
    if (!row) return;
    setCategories(updateServiceCategory(id, { active: !row.active }));
    setSavedHint('Categoría actualizada.');
  };

  return (
    <div className="space-y-4">
      {(tab === 'servicios' || savedHint) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {tab === 'servicios' && (
            <Button
              type="button"
              className="min-h-11 gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90"
              onClick={() => setNewOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo
            </Button>
          )}
          {savedHint && (
            <p role="status" className="text-sm text-green-700">
              {savedHint}
            </p>
          )}
        </div>
      )}

      <NewServiceDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        categories={categories}
        onCreated={(next) => {
          setOrders(next);
          setSavedHint('Servicio registrado.');
        }}
      />

      {tab === 'servicios' && (
        <div className="space-y-6">
          {agendaOrders.length > 0 && (
            <section aria-labelledby="services-agenda-heading" className="space-y-3">
              <h2 id="services-agenda-heading" className="text-base font-semibold text-balance">
                Próximas visitas
              </h2>
              <ul className="space-y-2">
                {agendaOrders.slice(0, 5).map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-3">
                      <CalendarClock
                        className="mt-0.5 size-5 shrink-0 text-[hsl(var(--admin-accent))]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold capitalize">{formatAgendaDate(row.scheduledAt)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(row.scheduledAt)} · {row.code} ·{' '}
                          {categoryName(row.categoryId)}
                        </p>
                        <p className="mt-1 text-sm">
                          <span className="font-medium">{row.customerName}</span>
                          {row.technician ? ` · ${row.technician}` : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[row.status]} className="w-fit shrink-0">
                      {STATUS_LABELS[row.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {orders.length === 0 ? (
            <AdminEmptyState
              title="Sin servicios registrados"
              description="Crea la primera orden con el botón Nuevo."
              icon={<Wrench className="size-5" aria-hidden="true" />}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Código</th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Categoría</th>
                    <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                      Programado
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{row.code}</td>
                      <td className="hidden px-4 py-3 md:table-cell">{row.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {categoryName(row.categoryId)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {formatDateTime(row.scheduledAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[row.status]}>
                          {STATUS_LABELS[row.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {NEXT_STATUS[row.status] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="min-h-9"
                              onClick={() => advanceStatus(row.id)}
                            >
                              → {STATUS_LABELS[NEXT_STATUS[row.status]!]}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-9 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(row.id, row.code)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'categorias' && (
        <div className="space-y-3">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tipos de servicio disponibles al registrar una orden (mantenimiento, correctivo,
            instalación, etc.).
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((cat) => (
              <article
                key={cat.id}
                className={cn(
                  'rounded-xl border bg-card p-4',
                  !cat.active && 'opacity-60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <Tags
                      className="mt-0.5 size-5 text-[hsl(var(--admin-accent))]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <Label htmlFor={`cat-name-${cat.id}`} className="sr-only">
                        Nombre
                      </Label>
                      <Input
                        id={`cat-name-${cat.id}`}
                        value={cat.name}
                        className="mb-2 font-semibold"
                        onChange={(e) => {
                          const next = updateServiceCategory(cat.id, { name: e.target.value });
                          setCategories(next);
                        }}
                      />
                      <Label htmlFor={`cat-desc-${cat.id}`} className="sr-only">
                        Descripción
                      </Label>
                      <Input
                        id={`cat-desc-${cat.id}`}
                        value={cat.description}
                        className="text-sm"
                        onChange={(e) => {
                          const next = updateServiceCategory(cat.id, {
                            description: e.target.value,
                          });
                          setCategories(next);
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={cat.active ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'min-h-9',
                      cat.active && 'bg-[hsl(var(--admin-accent))]',
                    )}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.active ? 'Activa' : 'Inactiva'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'precios' && (
        <Suspense
          fallback={
            <div className="flex min-h-[12rem] items-center justify-center" role="status">
              <span className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <span className="sr-only">Cargando lista de precios…</span>
            </div>
          }
        >
          <ServicesPriceListPanel
            categories={categories}
            items={priceList}
            onChange={setPriceList}
            onSaved={setSavedHint}
          />
        </Suspense>
      )}
    </div>
  );
}
