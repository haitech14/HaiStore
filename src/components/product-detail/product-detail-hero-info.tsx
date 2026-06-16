import { useCallback, useState } from 'react';
import { Download, FileText, Headphones, Shield, ShoppingCart, Truck } from 'lucide-react';

import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductBulkDiscountTable } from '@/components/product-detail/product-bulk-discount-table';
import { ProductDetailHeroFeatures } from '@/components/product-detail/product-detail-hero-features';
import { ProductDetailPriceBlock } from '@/components/product-detail/product-detail-price-block';
import { ProductQuoteDialog } from '@/components/product-detail/product-quote-dialog';
import { ProductQuotePdfViewer, type QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { cn } from '@/lib/utils';
import type { CartConfigurationLine } from '@/types/product';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  equipmentConfiguration?: CartConfigurationLine | undefined;
  accessoryProducts?: Product[];
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="space-y-2.5">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#0f1f3d]">
          <span
            className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[0.6rem] font-bold text-white"
            aria-hidden="true"
          >
            ✓
          </span>
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Envío',
    description: 'Envíos a todo el país en 1-3 días hábiles.',
  },
  {
    icon: Shield,
    title: 'Garantía',
    description: 'Garantía limitada de 1 año.',
  },
  {
    icon: Headphones,
    title: 'Soporte',
    description: 'Soporte técnico especializado.',
  },
] as const;

export function ProductDetailHeroInfo({
  product,
  detail,
  equipmentConfiguration,
  accessoryProducts = [],
}: ProductDetailHeroInfoProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<QuotePdfPreview | null>(null);

  const cartAddOptions =
    equipmentConfiguration || accessoryProducts.length > 0
      ? {
          ...(equipmentConfiguration ? { configuration: equipmentConfiguration } : {}),
          ...(accessoryProducts.length > 0 ? { accessoryProducts } : {}),
        }
      : undefined;

  const handlePreviewClose = useCallback((open: boolean) => {
    if (!open) {
      setPdfPreview((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return null;
      });
    }
  }, []);

  const brandLabel = detail.brandLabel?.trim();

  return (
    <div className="flex flex-col gap-5">
      {(brandLabel || detail.tagPills.length > 0) ? (
        <div className="flex w-full flex-wrap items-center gap-2">
          {brandLabel ? (
            <span className="inline-flex h-7 items-center rounded-full bg-red-50 px-3 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-600/15">
              {brandLabel}
            </span>
          ) : null}
          {detail.tagPills.map((pill) => (
            <span
              key={pill}
              className="inline-flex h-7 items-center rounded-full bg-muted px-3 text-xs font-semibold text-[#0f1f3d]"
            >
              {pill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-[1.75rem] lg:text-3xl lg:whitespace-nowrap">
          {detail.heroTitle}
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {detail.displaySubtitle}
        </p>
      </div>

      {detail.heroHighlights.length > 0 ? (
        <ProductDetailHeroFeatures highlights={detail.heroHighlights} />
      ) : null}

      {detail.bullets.length > 0 ? <BulletList bullets={detail.bullets} /> : null}

      <div className="overflow-hidden rounded-lg border border-border/70 bg-white">
        <ProductDetailPriceBlock product={product} detail={detail} showStock />

        {detail.bulkDiscountTiers.length > 0 ? (
          <ProductBulkDiscountTable
            embedded
            product={product}
            tiers={detail.bulkDiscountTiers}
          />
        ) : detail.wholesalePriceUsd != null ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 px-4 py-3">
            <span className="text-sm font-semibold text-[#0f1f3d]">Precio por mayor</span>
            <DualPrice usd={detail.wholesalePriceUsd} className="text-lg font-bold text-red-600" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => setQuoteOpen(true)}
          className={cn(
            'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white',
            'transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          )}
        >
          <FileText className="size-4" aria-hidden="true" />
          Solicitar cotización
        </button>

        <div className="flex flex-1 flex-col gap-3">
          <AddToCartButton
            product={product}
            {...(cartAddOptions ? { addOptions: cartAddOptions } : {})}
            variant="outline"
            size="lg"
            className="min-h-11 w-full rounded-lg border-2 border-[#0f1f3d] bg-white text-sm font-bold text-[#0f1f3d] hover:bg-muted/40 focus-visible:ring-[#0f1f3d]"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            {getAddToCartLabel(product, 'detail')}
          </AddToCartButton>

          {detail.technicalSheetUrl ? (
            <a
              href={detail.technicalSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-[#0f1f3d]',
                'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1f3d] focus-visible:ring-offset-2',
              )}
            >
              <Download className="size-4" aria-hidden="true" />
              Ficha técnica (PDF)
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Ficha técnica no disponible"
              className={cn(
                'inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-5 text-sm font-semibold text-muted-foreground',
              )}
            >
              <Download className="size-4" aria-hidden="true" />
              Ficha técnica (PDF)
            </button>
          )}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/15 px-3 py-3"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-red-600/20 bg-red-600/10 text-red-600"
                aria-hidden="true"
              >
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0f1f3d]">{item.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <ProductQuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        product={product}
        displayTitle={detail.displayTitle}
        sku={detail.sku}
        brandLabel={detail.brandLabel}
        equipmentConfiguration={equipmentConfiguration}
        onGenerated={setPdfPreview}
      />

      <ProductQuotePdfViewer preview={pdfPreview} onOpenChange={handlePreviewClose} />
    </div>
  );
}
