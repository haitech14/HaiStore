import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRentalPlans, useRentalPlansMutations } from '@/hooks/use-rental-plans';
import type { RentalPlanConfig } from '@/types/rental-plan';

function formatPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RentalPlansPanel() {
  const { data: serverPlans = [], isLoading } = useRentalPlans();
  const { savePlans } = useRentalPlansMutations();
  const [plans, setPlans] = useState<RentalPlanConfig[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPlans(serverPlans);
    setDirty(false);
  }, [serverPlans]);

  const persist = async (next: RentalPlanConfig[], message: string) => {
    setPlans(next);
    try {
      await savePlans.mutateAsync(next);
      setDirty(false);
      toast.success(message);
    } catch {
      toast.error('No se pudieron guardar los planes. Comprueba Supabase y la API.');
    }
  };

  const updateLocal = (id: string, patch: Partial<RentalPlanConfig>) => {
    setPlans((current) => current.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));
    setDirty(true);
  };

  const toggleActive = (id: string) => {
    const row = plans.find((p) => p.id === id);
    if (!row) return;
    void persist(
      plans.map((plan) => (plan.id === id ? { ...plan, active: !plan.active } : plan)),
      'Plan actualizado.',
    );
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando planes…</p>;
  }

  if (plans.length === 0) {
    return (
      <AdminEmptyState
        title="Sin planes de alquiler"
        description="Configura planes por volumen de páginas para multifuncionales en alquiler."
        icon={<Printer className="size-5" aria-hidden="true" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Planes sincronizados con Supabase (compartidos con HaiSupport). Se actualizan en la tienda en
        tiempo casi real.
      </p>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-right font-medium">Páginas / mes</th>
              <th className="px-4 py-3 text-right font-medium">Cuota mensual</th>
              <th className="px-4 py-3 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Label htmlFor={`plan-label-${plan.id}`} className="sr-only">
                    Nombre del plan
                  </Label>
                  <Input
                    id={`plan-label-${plan.id}`}
                    value={plan.label}
                    className="min-w-[10rem]"
                    onChange={(e) => updateLocal(plan.id, { label: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Label htmlFor={`plan-pages-${plan.id}`} className="sr-only">
                    Páginas por mes
                  </Label>
                  <Input
                    id={`plan-pages-${plan.id}`}
                    type="number"
                    min={500}
                    step={500}
                    className="ml-auto w-28 text-right"
                    value={plan.pagesPerMonth}
                    onChange={(e) =>
                      updateLocal(plan.id, { pagesPerMonth: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Label htmlFor={`plan-price-${plan.id}`} className="sr-only">
                    Precio mensual
                  </Label>
                  <Input
                    id={`plan-price-${plan.id}`}
                    type="number"
                    min={0}
                    step={1}
                    className="ml-auto w-28 text-right"
                    value={plan.monthlyPricePen}
                    onChange={(e) =>
                      updateLocal(plan.id, { monthlyPricePen: Number(e.target.value) || 0 })
                    }
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatPen(plan.monthlyPricePen)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant={plan.active ? 'default' : 'outline'}
                    size="sm"
                    className={plan.active ? 'bg-[hsl(var(--admin-accent))]' : undefined}
                    onClick={() => toggleActive(plan.id)}
                  >
                    {plan.active ? 'Activo' : 'Inactivo'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dirty && (
        <Button
          type="button"
          disabled={savePlans.isPending}
          onClick={() => void persist(plans, 'Planes guardados.')}
        >
          {savePlans.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      )}
    </div>
  );
}
