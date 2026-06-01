import { useState } from 'react';
import { Copy, FileDown, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { SaleOrderEditDialog } from '@/components/admin/sales/sale-order-edit-dialog';
import { Button } from '@/components/ui/button';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  fetchAdminOrderDetail,
  useDeleteOrder,
  useUpdateOrder,
} from '@/hooks/use-admin-order-mutations';
import { downloadSaleOrderPdf } from '@/lib/sale-order-pdf';
import {
  copySaleOrderWhatsAppMessage,
  openSaleOrderWhatsApp,
} from '@/lib/sale-order-whatsapp-message';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { UpdateSaleOrderPayload } from '@/types/sale-order-admin';
import type { StoreOrder } from '@/types/store';

interface SaleOrderActionsProps {
  order: Pick<StoreOrder, 'id' | 'order_number'>;
}

export function SaleOrderActions({ order }: SaleOrderActionsProps) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<StoreOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const deleteOrder = useDeleteOrder();
  const updateOrder = useUpdateOrder();
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;

  const loadDetail = async (): Promise<StoreOrder | null> => {
    try {
      return await fetchAdminOrderDetail(order.id);
    } catch {
      toast.error('No se pudo cargar el detalle de la venta');
      return null;
    }
  };

  const handleEdit = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      setEditing(detail);
      setEditOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (payload: UpdateSaleOrderPayload) => {
    if (!editing) return;
    await updateOrder.mutateAsync({ id: editing.id, payload });
    toast.success('Venta actualizada');
  };

  const handlePdf = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      await downloadSaleOrderPdf(detail, company);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsAppCopy = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      await copySaleOrderWhatsAppMessage(detail);
      toast.success('Mensaje copiado al portapapeles 📋');
    } catch {
      toast.error('No se pudo copiar el mensaje');
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsAppOpen = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      await copySaleOrderWhatsAppMessage(detail);
      const opened = openSaleOrderWhatsApp(detail);
      if (opened) {
        toast.success('WhatsApp abierto con el mensaje de la venta');
      } else {
        toast.success('Mensaje copiado. Pégalo en WhatsApp con el cliente.');
      }
    } catch {
      toast.error('No se pudo preparar el mensaje');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `¿Eliminar la venta ${order.order_number}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success('Venta eliminada');
    } catch {
      toast.error('No se pudo eliminar la venta');
    } finally {
      setBusy(false);
    }
  };

  const saving = updateOrder.isPending;

  return (
    <>
      <div className="flex flex-wrap justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          disabled={busy}
          aria-label={`Editar venta ${order.order_number}`}
          title="Editar"
          onClick={() => void handleEdit()}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          disabled={busy}
          aria-label={`Descargar PDF de ${order.order_number}`}
          title="Descargar PDF"
          onClick={() => void handlePdf()}
        >
          <FileDown className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          disabled={busy}
          aria-label={`Copiar mensaje WhatsApp de ${order.order_number}`}
          title="Copiar mensaje WhatsApp"
          onClick={() => void handleWhatsAppCopy()}
        >
          <Copy className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 text-green-700 hover:bg-green-50 hover:text-green-800"
          disabled={busy}
          aria-label={`Enviar WhatsApp de ${order.order_number}`}
          title="Enviar WhatsApp"
          onClick={() => void handleWhatsAppOpen()}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 text-destructive hover:bg-destructive/10"
          disabled={busy}
          aria-label={`Eliminar venta ${order.order_number}`}
          title="Eliminar"
          onClick={() => void handleDelete()}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <SaleOrderEditDialog
        order={editing}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSaveEdit}
        isSaving={saving}
      />
    </>
  );
}
