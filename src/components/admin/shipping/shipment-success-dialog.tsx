import { useMemo } from 'react';
import { Copy, FileText, MessageCircle, Pencil, ScrollText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildAgencyDisplay, buildShipmentCopyMessage, SHIPMENT_CONGRATS_MESSAGE } from '@/lib/shipment-copy-message';
import { printShipmentGuiaRemision } from '@/lib/shipment-guia-remision';
import { downloadShipmentPdf } from '@/lib/shipment-pdf';
import {
  copyShipmentWhatsAppMessage,
  openShipmentWhatsApp,
} from '@/lib/shipment-whatsapp-message';
import type { ShipmentRecord } from '@/types/shipping';

interface ShipmentSuccessDialogProps {
  shipment: ShipmentRecord | null;
  carrierName: string;
  onOpenChange: (open: boolean) => void;
  onEdit: (shipment: ShipmentRecord) => void;
}

export function ShipmentSuccessDialog({
  shipment,
  carrierName,
  onOpenChange,
  onEdit,
}: ShipmentSuccessDialogProps) {
  const agencyDisplay = useMemo(
    () => (shipment ? buildAgencyDisplay(carrierName, shipment.agencyDetail) : ''),
    [shipment, carrierName],
  );

  const copyMessage = useMemo(
    () =>
      shipment ? buildShipmentCopyMessage(shipment, { agencyDisplay }) : '',
    [shipment, agencyDisplay],
  );

  if (!shipment) return null;

  const context = { carrierName };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyMessage);
      toast.success('Mensaje copiado al portapapeles 📋');
    } catch {
      toast.error('No se pudo copiar el mensaje');
    }
  };

  const handleWhatsApp = async () => {
    try {
      await copyShipmentWhatsAppMessage(shipment, context);
    } catch {
      toast.error('No se pudo copiar el mensaje');
      return;
    }
    const opened = openShipmentWhatsApp(shipment, context);
    if (opened) {
      toast.success('WhatsApp abierto con el mensaje del envío');
    } else {
      toast.success('Mensaje copiado. Pégalo en WhatsApp con el cliente.');
    }
  };

  const handlePdf = async () => {
    try {
      await downloadShipmentPdf(shipment, context);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    }
  };

  const handleGuia = () => {
    printShipmentGuiaRemision(shipment, context);
    toast.success('Guía de remisión lista para imprimir');
  };

  return (
    <Dialog open={Boolean(shipment)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="space-y-2 border-b bg-green-50/80 px-6 py-5 text-left">
          <DialogTitle className="text-lg">¡Envío registrado! 🎉</DialogTitle>
          <DialogDescription className="text-sm text-foreground/80">
            {SHIPMENT_CONGRATS_MESSAGE}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mensaje para copiar / WhatsApp
          </p>
          <pre
            className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 font-sans text-xs leading-relaxed text-foreground"
            aria-label="Texto del envío"
          >
            {copyMessage}
          </pre>
        </div>

        <DialogFooter className="flex-col gap-2 border-t bg-muted/20 px-6 py-4 sm:flex-col">
          <Button type="button" className="w-full gap-2" onClick={() => void handleCopy()}>
            <Copy className="size-4" aria-hidden="true" />
            Copiar mensaje
          </Button>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={() => void handlePdf()}
            >
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              Enviar PDF
            </Button>
            <Button type="button" variant="outline" className="gap-1.5" onClick={handleGuia}>
              <ScrollText className="size-4 shrink-0" aria-hidden="true" />
              Guía de remisión
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={() => void handleWhatsApp()}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              onOpenChange(false);
              onEdit(shipment);
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar envío
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
