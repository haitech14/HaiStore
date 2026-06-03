import { useState } from 'react';
import { FileDown } from 'lucide-react';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { buildProductQuotePdf } from '@/lib/generate-product-quote-pdf';
import {
  haitechClientSchema,
  EMPTY_HAITECH_CLIENT,
} from '@/lib/haitech-client-schema';
import { usdToPen } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { Product } from '@/types/product';

interface ProductQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  onGenerated: (preview: QuotePdfPreview) => void;
}

export function ProductQuoteDialog({
  open,
  onOpenChange,
  product,
  displayTitle,
  sku,
  brandLabel,
  onGenerated,
}: ProductQuoteDialogProps) {
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const parsed = haitechClientSchema.safeParse(client);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      setIsSubmitting(false);
      return;
    }

    const values = {
      razonSocial: parsed.data.nombre,
      ruc: parsed.data.rucDni,
      atencion: parsed.data.nombreContacto,
      celular: parsed.data.telefono,
      ciudad: parsed.data.ciudad,
    };

    try {
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const generated = await buildProductQuotePdf(
        values,
        {
          name: displayTitle,
          sku,
          brand: brandLabel,
          pricePen: usdToPen(product.price),
          quantity: 1,
          imageUrl: product.image_url,
        },
        company,
      );

      const url = URL.createObjectURL(generated.blob);
      onGenerated({
        url,
        filename: generated.filename,
        blob: generated.blob,
        quoteNumber: generated.quoteNumber,
      });

      try {
        await registerProductQuote.mutateAsync(
          buildProformaPayloadFromProductQuote(
            generated.quoteNumber,
            values,
            {
              id: product.id,
              name: displayTitle,
              sku,
              brand: brandLabel,
              pricePen: usdToPen(product.price),
              imageUrl: product.image_url,
            },
            company.quoteValidityDays,
          ),
        );
      } catch {
        setSubmitError(
          'PDF generado, pero no se pudo registrar la cotización en el panel de ventas.',
        );
        setIsSubmitting(false);
        return;
      }

      setClient(EMPTY_HAITECH_CLIENT);
      onOpenChange(false);
    } catch {
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Descargar cotización</DialogTitle>
          <DialogDescription>
            Complete los datos del cliente (mismo formulario que HaiSupport) para generar el PDF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4" noValidate>
          <HaitechClientForm value={client} onChange={setClient} idPrefix="quote" />

          {submitError && (
            <p role="alert" className="text-xs text-red-600">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <FileDown className="size-4" aria-hidden="true" />
            {isSubmitting ? 'Generando PDF…' : 'Generar cotización PDF'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
