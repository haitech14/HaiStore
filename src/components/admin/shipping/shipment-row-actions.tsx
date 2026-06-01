import {
  ArrowRight,
  Copy,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { printShipmentLabel } from '@/lib/shipment-label';
import {
  copyShipmentWhatsAppMessage,
  openShipmentWhatsApp,
} from '@/lib/shipment-whatsapp-message';
import type { ShipmentRecord, ShipmentStatus } from '@/types/shipping';

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending_pickup: 'Por recoger',
  in_transit: 'En tránsito',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  failed: 'Fallido',
};

interface ShipmentRowActionsProps {
  shipment: ShipmentRecord;
  carrierName: string;
  zoneName: string;
  nextStatus?: ShipmentStatus;
  onAdvance?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

export function ShipmentRowActions({
  shipment,
  carrierName,
  zoneName,
  nextStatus,
  onAdvance,
  onDuplicate,
  onDelete,
  onEdit,
}: ShipmentRowActionsProps) {
  const context = { carrierName, zoneName };

  const handleWhatsApp = async () => {
    try {
      await copyShipmentWhatsAppMessage(shipment, context);
    } catch {
      toast.error('No se pudo copiar el mensaje');
      return;
    }

    const opened = openShipmentWhatsApp(shipment, context);
    if (opened) {
      toast.success('WhatsApp abierto con el mensaje del envío 📲', {
        description: 'El texto también quedó en el portapapeles por si necesitas editarlo.',
      });
      return;
    }

    toast.success('Mensaje copiado al portapapeles 📋', {
      description: shipment.customerPhone
        ? 'Agrega un teléfono válido al envío para abrir WhatsApp directo.'
        : 'Pégalo en WhatsApp y agrega el teléfono del cliente.',
    });
  };

  const handleLabel = () => {
    printShipmentLabel(shipment, context);
    toast.success('Rótulo listo para imprimir 🖨️');
  };

  const handleDuplicate = () => {
    onDuplicate();
    toast.success('Envío duplicado');
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        `¿Eliminar el envío ${shipment.orderRef} de ${shipment.customerName}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    onDelete();
    toast.success('Envío eliminado');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 min-h-9 gap-1.5 px-2.5"
          aria-label={`Acciones del envío ${shipment.orderRef}`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {nextStatus && onAdvance && (
          <DropdownMenuItem onClick={onAdvance} className="gap-2">
            <ArrowRight className="size-4" aria-hidden="true" />
            Avanzar a {STATUS_LABELS[nextStatus]}
          </DropdownMenuItem>
        )}
        {nextStatus && onAdvance ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem onClick={handleLabel} className="gap-2">
          <Printer className="size-4" aria-hidden="true" />
          Generar rótulo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleWhatsApp()} className="gap-2">
          <MessageCircle className="size-4" aria-hidden="true" />
          Enviar WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} className="gap-2">
          <Copy className="size-4" aria-hidden="true" />
          Duplicar
        </DropdownMenuItem>
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2">
            <Pencil className="size-4" aria-hidden="true" />
            Editar envío
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
