import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadRentalPlans, saveRentalPlans, updateRentalPlan } from '@/lib/rental-plans-storage';
import type { RentalPlanConfig } from '@/types/rental-plan';

function formatPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RentalPlansPanel() {
  const [plans, setPlans] = useState<RentalPlanConfig[]>(() => loadRentalPlans());
  const [savedHint, setSavedHint] = useState<string | null>(null);

  useEffect(() => {
    if (!savedHint) return;
    const t = window.setTimeout(() => setSavedHint(null), 2500);
    return () => window.clearTimeout(t);
  }, [savedHint]);

  const persist = (next: RentalPlanConfig[], message: string) => {
    setPlans(next);
    saveRentalPlans(next);
    setSavedHint(message);
  };

  const toggleActive = (id: string) => {
    const row = plans.find((p) => p.id === id);
    if (!row) return;
    persist(updateRentalPlan(id, { active: !row.active }), 'Plan actualizado.');
  };

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
      {savedHint && (
        <p role="status" className="text-sm text-green-700">
          {savedHint}
        </p>
      )}

      <p className="max-w-2xl text-sm text-muted-foreground">
        Planes mensuales mostrados en la ficha de producto (alquiler de equipos). Los precios están en
        soles (PEN) e incluyen el volumen de páginas indicado.
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
                    onChange={(e) => {
                      const next = updateRentalPlan(plan.id, { label: e.target.value });
                      setPlans(next);
                    }}
                    onBlur={() => setSavedHint('Planes guardados.')}
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
                    onChange={(e) => {
                      const next = updateRentalPlan(plan.id, {
                        pagesPerMonth: Number(e.target.value) || 0,
                      });
                      setPlans(next);
                    }}
                    onBlur={() => {
                      saveRentalPlans(plans);
                      setSavedHint('Planes guardados.');
                    }}
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
                    onChange={(e) => {
                      const next = updateRentalPlan(plan.id, {
                        monthlyPricePen: Number(e.target.value) || 0,
                      });
                      setPlans(next);
                    }}
                    onBlur={() => {
                      saveRentalPlans(plans);
                      setSavedHint('Planes guardados.');
                    }}
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

      <aside className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Alquiler en tienda</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Los clientes eligen el plan en la ficha del equipo multifuncional.</li>
          <li>Incluye mantenimiento, tóner y soporte según contrato comercial.</li>
          <li>Contacto comercial: ventas Haitech para activar contrato formal.</li>
        </ul>
      </aside>
    </div>
  );
}
