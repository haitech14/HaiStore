import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRentalRequestMutations } from '@/hooks/use-rental-requests';
import { useRentalPlans } from '@/hooks/use-rental-plans';
import { haitechClientSchema, EMPTY_HAITECH_CLIENT } from '@/lib/haitech-client-schema';
import { haitechFormToClient } from '@/lib/haitech-client-mappers';
import { cn } from '@/lib/utils';

interface NewRentalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function NewRentalRequestDialog({
  open,
  onOpenChange,
  onCreated,
}: NewRentalRequestDialogProps) {
  const { createRequest } = useRentalRequestMutations();
  const { data: plans = [] } = useRentalPlans({ activeOnly: true });
  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [planId, setPlanId] = useState('');
  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setClient(EMPTY_HAITECH_CLIENT);
    setPlanId(plans[0]?.id ?? '');
    setProductName('');
    setStartDate(nextWeek.toISOString().slice(0, 10));
    setNotes('');
    setError(null);
  }, [open, plans]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = haitechClientSchema.safeParse(client);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos de cliente inválidos');
      return;
    }
    if (!planId) {
      setError('Selecciona un plan de alquiler.');
      return;
    }
    if (!startDate) {
      setError('Indica la fecha de inicio.');
      return;
    }

    try {
      await createRequest.mutateAsync({
        customer: haitechFormToClient(parsed.data),
        planId,
        productName: productName.trim() || null,
        startDate,
        notes: notes.trim() || null,
      });
      onCreated();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la solicitud');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva solicitud de alquiler</DialogTitle>
          <DialogDescription>
            Registra una solicitud de alquiler con datos de cliente alineados a HaiSupport.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <HaitechClientForm value={client} onChange={setClient} idPrefix="rent" />

          <div className="space-y-1.5">
            <Label htmlFor="rent-plan">Plan de alquiler</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger id="rent-plan">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.label} — S/ {plan.monthlyPricePen.toLocaleString('es-PE')}/mes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rent-product">Equipo (opcional)</Label>
            <Input
              id="rent-product"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Modelo o referencia del equipo"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rent-start">Fecha de inicio</Label>
            <Input
              id="rent-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rent-notes">Notas</Label>
            <textarea
              id="rent-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(
                'flex min-h-[3rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRequest.isPending} className="gap-2">
              <Plus className="size-4" aria-hidden="true" />
              {createRequest.isPending ? 'Guardando…' : 'Crear solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
