import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

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
import { createServiceOrder } from '@/lib/services-storage';
import { cn } from '@/lib/utils';
import type { ServiceCategory, ServiceOrder } from '@/types/service';

interface NewServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  onCreated: (orders: ServiceOrder[]) => void;
}

const EMPTY = {
  customerName: '',
  customerPhone: '',
  categoryId: '',
  scheduledDate: '',
  scheduledTime: '09:00',
  description: '',
  technician: '',
  address: '',
};

export function NewServiceDialog({
  open,
  onOpenChange,
  categories,
  onCreated,
}: NewServiceDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const activeCategories = categories.filter((c) => c.active);

  useEffect(() => {
    if (!open) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstCategory = categories.find((c) => c.active)?.id ?? '';
    setForm({
      ...EMPTY,
      categoryId: firstCategory,
      scheduledDate: tomorrow.toISOString().slice(0, 10),
    });
    setError(null);
  }, [open, categories]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customerName.trim()) {
      setError('Indica el cliente.');
      return;
    }
    if (!form.categoryId) {
      setError('Selecciona una categoría de servicio.');
      return;
    }
    if (!form.scheduledDate) {
      setError('Indica la fecha programada.');
      return;
    }
    if (!form.description.trim()) {
      setError('Describe el servicio solicitado.');
      return;
    }

    const scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime}:00`).toISOString();
    const next = createServiceOrder({
      customerName: form.customerName,
      customerPhone: form.customerPhone || null,
      categoryId: form.categoryId,
      scheduledAt,
      description: form.description,
      technician: form.technician || null,
      address: form.address || null,
    });
    onCreated(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo servicio</DialogTitle>
          <DialogDescription>
            Registra una orden de servicio técnico y prográmala en la agenda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="svc-customer">Cliente</Label>
            <Input
              id="svc-customer"
              value={form.customerName}
              onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
              placeholder="Razón social o nombre"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-phone">Teléfono</Label>
              <Input
                id="svc-phone"
                value={form.customerPhone}
                inputMode="tel"
                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-category">Categoría</Label>
              <Select
                value={form.categoryId}
                onValueChange={(categoryId) => setForm((p) => ({ ...p, categoryId }))}
              >
                <SelectTrigger id="svc-category">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-date">Fecha programada</Label>
              <Input
                id="svc-date"
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-time">Hora</Label>
              <Input
                id="svc-time"
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-tech">Técnico asignado</Label>
            <Input
              id="svc-tech"
              value={form.technician}
              onChange={(e) => setForm((p) => ({ ...p, technician: e.target.value }))}
              placeholder="Opcional"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-address">Dirección / sede</Label>
            <Input
              id="svc-address"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">Descripción del servicio</Label>
            <textarea
              id="svc-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={cn(
                'flex min-h-[5rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
            <Button
              type="submit"
              className="gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              Crear servicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
