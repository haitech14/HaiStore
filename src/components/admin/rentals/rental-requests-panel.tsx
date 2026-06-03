import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { NewRentalRequestDialog } from '@/components/admin/rentals/new-rental-request-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useRentalRequestMutations,
  useRentalRequests,
} from '@/hooks/use-rental-requests';
import { formatTpvMoney } from '@/lib/tpv-pricing';
import type { RentalRequestStatus } from '@/types/haitech-domain';

const STATUS_LABELS: Record<RentalRequestStatus, string> = {
  pending: 'Pendiente',
  quoted: 'Cotizado',
  active: 'Activo',
  ended: 'Finalizado',
  cancelled: 'Cancelado',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

export function RentalRequestsPanel() {
  const { data: requests = [], isLoading } = useRentalRequests();
  const { updateRequest, deleteRequest } = useRentalRequestMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests],
  );

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`¿Eliminar la solicitud ${code}?`)) return;
    setBusyId(id);
    try {
      await deleteRequest.mutateAsync(id);
      toast.success('Solicitud eliminada');
    } catch {
      toast.error('No se pudo eliminar');
    } finally {
      setBusyId(null);
    }
  };

  const advanceStatus = async (id: string, status: RentalRequestStatus) => {
    setBusyId(id);
    try {
      await updateRequest.mutateAsync({ id, payload: { status } });
    } catch {
      toast.error('No se pudo actualizar el estado');
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {sorted.length} solicitud{sorted.length === 1 ? '' : 'es'} de alquiler (sincronizadas con HaiSupport)
        </p>
        <Button type="button" className="min-h-11 gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva solicitud
        </Button>
      </div>

      {sorted.length === 0 ? (
        <AdminEmptyState
          title="Sin solicitudes de alquiler"
          description="Registra solicitudes de alquiler con los mismos datos de cliente que HaiSupport."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Cuota</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((req) => {
                const busy = busyId === req.id;
                const customer = req.customerSnapshot;
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold tabular-nums">{req.code}</TableCell>
                    <TableCell>
                      <p className="font-medium">{customer.nombre || '—'}</p>
                      <p className="text-xs text-muted-foreground">{customer.nombreContacto}</p>
                    </TableCell>
                    <TableCell>{req.planLabel}</TableCell>
                    <TableCell>{formatDate(req.startDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{STATUS_LABELS[req.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatTpvMoney(req.monthlyPricePen, 'PEN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {req.status === 'pending' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void advanceStatus(req.id, 'quoted')}
                          >
                            Cotizar
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="size-9 text-destructive"
                          disabled={busy}
                          aria-label="Eliminar"
                          onClick={() => void handleDelete(req.id, req.code)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <NewRentalRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => toast.success('Solicitud de alquiler registrada')}
      />
    </div>
  );
}
