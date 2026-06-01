import { useEffect, useState, type FormEvent } from 'react';

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
import {
  STORE_ORDER_STATUS_LABELS,
  STORE_PAYMENT_STATUS_LABELS,
} from '@/lib/admin-order-status';
import { cn } from '@/lib/utils';
import type { StoreOrder, StoreOrderStatus, StorePaymentStatus } from '@/types/store';
import type { UpdateSaleOrderPayload } from '@/types/sale-order-admin';

interface SaleOrderEditDialogProps {
  order: StoreOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateSaleOrderPayload) => Promise<void>;
  isSaving: boolean;
}

const ORDER_STATUSES = Object.keys(STORE_ORDER_STATUS_LABELS) as StoreOrderStatus[];
const PAYMENT_STATUSES = Object.keys(STORE_PAYMENT_STATUS_LABELS) as StorePaymentStatus[];

function customerSummary(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.full_name?.trim() ||
    customer?.company_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

export function SaleOrderEditDialog({
  order,
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: SaleOrderEditDialogProps) {
  const [form, setForm] = useState<UpdateSaleOrderPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && order) {
      setForm({
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method ?? '',
        notes: order.notes ?? '',
      });
      setError(null);
    }
  }, [open, order]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !order) return;
    setError(null);
    try {
      await onSubmit({
        status: form.status ?? order.status,
        payment_status: form.payment_status ?? order.payment_status,
        payment_method: form.payment_method?.trim() || null,
        notes: form.notes?.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  };

  if (!order || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar venta {order.order_number}</DialogTitle>
          <DialogDescription>Cliente: {customerSummary(order)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sale-status">Estado del pedido</Label>
            <Select
              value={form.status ?? order.status}
              onValueChange={(value) =>
                setForm({ ...form, status: value as StoreOrderStatus })
              }
            >
              <SelectTrigger id="sale-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STORE_ORDER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-payment-status">Estado de pago</Label>
            <Select
              value={form.payment_status ?? order.payment_status}
              onValueChange={(value) =>
                setForm({ ...form, payment_status: value as StorePaymentStatus })
              }
            >
              <SelectTrigger id="sale-payment-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STORE_PAYMENT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-payment-method">Método de pago</Label>
            <Input
              id="sale-payment-method"
              value={form.payment_method ?? ''}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              placeholder="Ej. transferencia, Yape, efectivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-notes">Notas internas</Label>
            <textarea
              id="sale-notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={cn(
                'flex min-h-[4.5rem] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
