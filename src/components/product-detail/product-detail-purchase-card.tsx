import { useMemo, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Minus, Plus, Shield, ShoppingCart, Truck, Zap } from 'lucide-react';

import { AddToCartButton, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductBulkDiscountTable } from '@/components/product-detail/product-bulk-discount-table';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { BulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { ensureFullPrices } from '@/lib/roles';
import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { cn, penToUsd } from '@/lib/utils';
import {
  computeEquipmentRentalEstimate,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { ProductDetailPurchaseMode } from '@/components/product-detail/product-detail-purchase-mode';
import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import type { CartConfigurationLine } from '@/types/product';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailPurchaseCardProps {
  product: Product;
  detail: ProductDetailViewModel;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  volumePricing: BulkDiscountPricing;
  purchaseActionsRef?: RefObject<HTMLDivElement | null>;
  equipmentConfiguration?: CartConfigurationLine;
  onQuoteGenerated?: (preview: QuotePdfPreview) => void;
  purchaseMode?: PurchaseMode;
  onPurchaseModeChange?: (mode: PurchaseMode) => void;
  rentalEstimate?: EquipmentRentalEstimate | null;
}

export function ProductDetailPurchaseCard({
  product,
  detail,
  quantity,
  onQuantityChange,
  volumePricing,
  purchaseActionsRef,
  equipmentConfiguration,
  onQuoteGenerated,
  purchaseMode,
  onPurchaseModeChange,
  rentalEstimate = null,
}: ProductDetailPurchaseCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = fullPrices.public;
  const outOfStock = isProductOutOfStock(product);
  const stockDisplay = outOfStock ? 0 : product.stock;
  const maxQuantity = outOfStock ? 1 : Math.max(1, stockDisplay || 99);
  const hasVolumeDiscount =
    volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const isRentMode = purchaseMode === 'rent' && detail.rentalPlans.length > 0;
  const isColorEquipment = useMemo(() => isColorPrinterEquipment(product), [product]);

  const fallbackRentalEstimate = useMemo(() => {
    if (!isRentMode) return null;
    return computeEquipmentRentalEstimate({
      monthlyPages: detail.rentalPlans[0]?.pagesPerMonth ?? 5000,
      equipmentQuantity: 1,
      termMonths: 12,
      equipmentBasePriceUsd: displayUsd,
      isColorEquipment,
      includePaper: false,
      includeOperator: false,
      includeLaptop: false,
      includeLaminator: false,
      includeGuillotine: false,
    });
  }, [detail.rentalPlans, displayUsd, isRentMode, isColorEquipment]);

  const activeRentalEstimate = rentalEstimate ?? fallbackRentalEstimate;

  const offerUnitUsd = volumePricing.unitUsd;
  const normalPriceUsd =
    detail.oldPricePen != null
      ? penToUsd(detail.oldPricePen)
      : detail.isOnOffer
        ? displayUsd
        : null;
  const showNormalPrice =
    normalPriceUsd != null && normalPriceUsd > offerUnitUsd + 0.001;

  const cartAddOptions = useMemo(
    () => ({
      quantity,
      ...(hasVolumeDiscount ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
      ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
    }),
    [quantity, hasVolumeDiscount, volumePricing.unitUsd, equipmentConfiguration],
  );

  const adjustQuantity = (delta: number) => {
    onQuantityChange(Math.max(1, Math.min(maxQuantity, quantity + delta)));
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const priceBlock = isRentMode && activeRentalEstimate ? (
    <div>
      <p className="text-xs font-semibold text-foreground">Total configurado</p>
      <p
        className="mt-0.5 text-2xl font-bold leading-tight text-red-600 sm:text-[1.75rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        <DualPrice usd={penToUsd(activeRentalEstimate.estimatedMonthlyPen)} />
        <span className="ml-1 text-sm font-semibold text-muted-foreground">/ mes</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Plan {activeRentalEstimate.termMonths} meses · cuota variable{' '}
        <DualPrice
          usd={penToUsd(activeRentalEstimate.variableFeeMonthlyPen)}
          className="inline font-medium text-foreground"
        />
        {activeRentalEstimate.isColorEquipment ? (
          <>
            {' '}
            (negro{' '}
            <DualPrice
              usd={penToUsd(activeRentalEstimate.blackVariableMonthlyPen)}
              className="inline font-medium text-foreground"
            />
            {' + '}color{' '}
            <DualPrice
              usd={penToUsd(activeRentalEstimate.colorVariableMonthlyPen)}
              className="inline font-medium text-foreground"
            />
            )
          </>
        ) : null}
        {' + '}
        cuota fija{' '}
        <DualPrice
          usd={penToUsd(activeRentalEstimate.fixedFeeMonthlyPen)}
          className="inline font-medium text-foreground"
        />
      </p>
      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
        {activeRentalEstimate.equipmentQuantity} equipo
        {activeRentalEstimate.equipmentQuantity > 1 ? 's' : ''} ·{' '}
        {activeRentalEstimate.billablePages.toLocaleString('es-PE')} pág./mes · IGV incluido
      </p>
    </div>
  ) : (
    <div>
      <p className="text-xs font-semibold text-foreground">Oferta</p>
      <p
        className="mt-0.5 text-2xl font-bold leading-tight text-red-600 sm:text-[1.75rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        <DualPrice usd={quantity > 1 ? volumePricing.totalUsd : offerUnitUsd} />
      </p>
      {quantity > 1 ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          <DualPrice usd={offerUnitUsd} className="inline" /> por unidad · {quantity} ud.
        </p>
      ) : null}
      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">IGV incluido</p>
      {showNormalPrice ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Precio normal:{' '}
          <DualPrice
            usd={normalPriceUsd}
            strikethrough
            className="inline font-medium text-muted-foreground"
          />
        </p>
      ) : null}
    </div>
  );

  return (
    <aside
      ref={purchaseActionsRef}
      className="min-w-0 lg:sticky lg:top-24 lg:self-start"
      aria-labelledby="compra-producto-titulo"
    >
      <h2 id="compra-producto-titulo" className="sr-only">
        Comprar {product.name}
      </h2>

      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm sm:p-5">
        {purchaseMode != null && onPurchaseModeChange ? (
          <ProductDetailPurchaseMode
            purchaseMode={purchaseMode}
            onPurchaseModeChange={onPurchaseModeChange}
            rentalPlans={detail.rentalPlans}
            className="mb-3"
          />
        ) : null}

        {priceBlock}

        {detail.bulkDiscountTiers.length > 0 && !isRentMode ? (
          <div className="mt-4">
            <ProductBulkDiscountTable
              product={product}
              tiers={detail.bulkDiscountTiers}
              quantity={quantity}
              purchaseEmbedded
            />
          </div>
        ) : null}

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Cantidad</p>
          <div
            className="flex h-11 items-stretch overflow-hidden rounded-lg border border-border bg-background"
            role="group"
            aria-label="Cantidad"
          >
            <button
              type="button"
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= 1 || outOfStock}
              aria-label="Disminuir cantidad"
              className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              className="flex min-w-10 flex-1 items-center justify-center border-x border-border text-sm font-semibold text-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => adjustQuantity(1)}
              disabled={quantity >= maxQuantity || outOfStock}
              aria-label="Aumentar cantidad"
              className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <AddToCartButton
            product={product}
            addOptions={cartAddOptions}
            size="lg"
            disabled={outOfStock}
            className="h-11 min-h-11 w-full gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:ring-red-600"
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            Añadir al carrito
          </AddToCartButton>

          <Button
            type="button"
            size="lg"
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="h-11 min-h-11 w-full gap-2 rounded-lg border-0 bg-[#0f1f3d] text-sm font-semibold text-white hover:bg-[#0f1f3d]/90 focus-visible:ring-[#0f1f3d]"
          >
            <Zap className="size-4 shrink-0" aria-hidden="true" />
            Comprar ahora
          </Button>

          <ProductWhatsAppButton
            stopPropagation={false}
            accent="solid"
            label="Comprar por WhatsApp"
            quantity={quantity}
            product={{
              id: product.id,
              name: product.name,
              priceUsd: offerUnitUsd,
              category: product.category,
              brand: product.brand ?? null,
            }}
            quoteContext={{
              product,
              displayTitle: detail.displayTitle,
              sku: detail.sku,
              brandLabel: detail.brandLabel,
              categoryLabel: detail.categoryLabel,
              heroSpecBullets: detail.heroSpecBullets,
              heroLead: detail.heroLead,
              heroDescription: detail.heroDescription,
              quantity,
              ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
            }}
            {...(onQuoteGenerated ? { onQuoteGenerated } : {})}
            className={cn(
              'h-11 min-h-11 w-full gap-2 rounded-lg border-0 bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:ring-emerald-600',
            )}
          />
        </div>

        <ul className="mt-5 space-y-3 border-t border-border/60 pt-4 text-xs leading-snug text-muted-foreground">
          <li className="flex gap-2.5">
            <Truck className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Envío rápido</p>
              <p>Entrega segura y rastreable a todo el país</p>
            </div>
          </li>
          <li className="flex gap-2.5">
            <Shield className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Garantía oficial</p>
              <p>12 meses de garantía {detail.brandLabel || 'del fabricante'}</p>
            </div>
          </li>
          <li className="flex gap-2.5">
            <Headphones className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Soporte técnico</p>
              <p>Asesoría pre y postventa especializada</p>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}
