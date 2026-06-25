import { useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cartItemsToTpvLines } from '@/lib/cart-to-tpv-lines';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import {
  EMPTY_HAITECH_CLIENT,
  haitechClientSchema,
} from '@/lib/haitech-client-schema';
import { nextTpvDocumentNumber } from '@/lib/tpv-document-serial';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CartItem } from '@/types/product';
import type { TpvCustomer } from '@/types/tpv';

interface CartQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
}

export function CartQuoteDialog({ open, onOpenChange, items }: CartQuoteDialogProps) {
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<QuotePdfPreview | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitError(null);
      setClient(EMPTY_HAITECH_CLIENT);
    }
    onOpenChange(next);
  };

  const handlePdfPreviewClose = (next: boolean) => {
    if (!next && pdfPreview?.url) {
      URL.revokeObjectURL(pdfPreview.url);
      setPdfPreview(null);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError('El carrito está vacío.');
      return;
    }

    const parsed = haitechClientSchema.safeParse(client);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    setIsSubmitting(true);

    const customer: TpvCustomer = {
      razonSocial: parsed.data.nombre.trim(),
      documento: parsed.data.rucDni.trim(),
      atencion: parsed.data.nombreContacto.trim(),
      celular: parsed.data.telefono.trim(),
      direccion: parsed.data.ciudad.trim() || 'Lima',
      ciudad: parsed.data.ciudad.trim() || 'Lima',
      priceList: 'public',
      currency: 'PEN',
      storeCustomerId: null,
    };

    const lines = cartItemsToTpvLines(items);
    const values = {
      razonSocial: parsed.data.nombre,
      ruc: parsed.data.rucDni,
      atencion: parsed.data.nombreContacto,
      celular: parsed.data.telefono,
      ciudad: parsed.data.ciudad,
    };

    try {
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const documentNumber = nextTpvDocumentNumber('proforma');
      const { buildTpvDocumentPdf } = await import('@/lib/generate-tpv-document-pdf');
      const generated = await buildTpvDocumentPdf(
        'proforma',
        documentNumber,
        customer,
        lines,
        company,
      );
      const pdfBlob =
        generated.blob.type === 'application/pdf'
          ? generated.blob
          : new Blob([generated.blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      setPdfPreview({
        url,
        blob: pdfBlob,
        filename: generated.filename,
        quoteNumber: documentNumber,
      });
      setClient(EMPTY_HAITECH_CLIENT);
      handleOpenChange(false);

      void registerProductQuote
        .mutateAsync(
          buildProformaPayloadFromProductQuote(
            documentNumber,
            values,
            lines.map((line) => ({
              id: line.productId,
              name: line.name,
              sku: line.sku,
              brand: line.brand,
              pricePen: line.unitPricePen,
              quantity: line.quantity,
              imageUrl: line.imageUrl ?? null,
            })),
            company.quoteValidityDays,
          ),
        )
        .catch(() => {
          toast.warning(
            'PDF generado, pero no se pudo registrar la cotización en el panel de ventas.',
          );
        });
    } catch {
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[min(96vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-red-600" aria-hidden="true" />
              Generar cotización
            </DialogTitle>
            <DialogDescription>
              Completa los datos del cliente para emitir un PDF con los {items.length}{' '}
              {items.length === 1 ? 'producto' : 'productos'} del carrito.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(event) => void onSubmit(event)} noValidate>
            <HaitechClientForm value={client} onChange={setClient} idPrefix="cart-quote" />

            {submitError ? (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="min-h-11 bg-red-600 hover:bg-red-500"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? 'Generando PDF…' : 'Generar cotización PDF'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProductQuotePdfViewer preview={pdfPreview} onOpenChange={handlePdfPreviewClose} autoDownload />
    </>
  );
}
