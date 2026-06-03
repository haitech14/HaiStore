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
import { useServiceRequestMutations } from '@/hooks/use-service-requests';
import { haitechClientSchema, EMPTY_HAITECH_CLIENT } from '@/lib/haitech-client-schema';
import { haitechFormToClient } from '@/lib/haitech-client-mappers';
import { cn } from '@/lib/utils';
import type { ServiceCategoryRecord } from '@/types/haitech-domain';

interface NewServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategoryRecord[];
  onCreated: () => void;
}

export function NewServiceDialog({
  open,
  onOpenChange,
  categories,
  onCreated,
}: NewServiceDialogProps) {
  const { createRequest } = useServiceRequestMutations();
  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [categoryId, setCategoryId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeCategories = categories.filter((c) => c.active);

  useEffect(() => {
    if (!open) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setClient(EMPTY_HAITECH_CLIENT);
    setCategoryId(activeCategories[0]?.id ?? '');
    setScheduledDate(tomorrow.toISOString().slice(0, 10));
    setScheduledTime('09:00');
    setDescription('');
    setTechnician('');
    setError(null);
  }, [open, activeCategories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = haitechClientSchema.safeParse(client);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos de cliente inválidos');
      return;
    }
    if (!categoryId) {
      setError('Selecciona una categoría de servicio.');
      return;
    }
    if (!scheduledDate) {
      setError('Indica la fecha programada.');
      return;
    }
    if (!description.trim()) {
      setError('Describe el servicio solicitado.');
      return;
    }

    const category = activeCategories.find((c) => c.id === categoryId);
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    try {
      await createRequest.mutateAsync({
        customer: haitechFormToClient(parsed.data),
        categoryId,
        categoryLabel: category?.name ?? categoryId,
        description: description.trim(),
        scheduledAt,
        technician: technician.trim() || null,
        address: parsed.data.direccion,
        city: parsed.data.ciudad,
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
          <DialogTitle>Nueva solicitud de servicio</DialogTitle>
          <DialogDescription>
            Registra una solicitud de servicio técnico con los mismos datos de cliente que HaiSupport.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <HaitechClientForm value={client} onChange={setClient} idPrefix="svc" />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
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
            <div className="space-y-1.5">
              <Label htmlFor="svc-tech">Técnico asignado</Label>
              <Input
                id="svc-tech"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-date">Fecha programada</Label>
              <Input
                id="svc-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-time">Hora</Label>
              <Input
                id="svc-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">Descripción del servicio</Label>
            <textarea
              id="svc-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              disabled={createRequest.isPending}
              className="gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              {createRequest.isPending ? 'Guardando…' : 'Crear solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
