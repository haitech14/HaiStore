import { useEffect, useMemo, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';

import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { formatVolumeQuantityPromoMessage } from '@/lib/display-price';
import {
  resolveBulkDiscountPricing,
  resolveBulkDiscountSavingsHint,
  type BulkDiscountPricing,
} from '@/lib/bulk-discount-tiers';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { cn } from '@/lib/utils';
import {
  MOBILE_PURCHASE_BAR_HEIGHT_PX,
  useSetMobileBottomInset,
} from '@/context/mobile-bottom-inset-context';
import type { CartConfigurationLine } from '@/types/product';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailMobilePurchaseBarProps {
  product: Product;
  quantity: number;
  volumePricing: BulkDiscountPricing;
  basePriceUsd: number;
  bulkDiscountTiers: BulkDiscountTier[];
  floorPriceUsd?: number;
  outOfStock: boolean;
  purchaseActionsRef: RefObject<HTMLDivElement | null>;
  equipmentConfiguration?: CartConfigurationLine;
}

export function ProductDetailMobilePurchaseBar({
  product,
  quantity,
  volumePricing,
  basePriceUsd,
  bulkDiscountTiers,
  floorPriceUsd = 0,
  outOfStock,
  purchaseActionsRef,
  equipmentConfiguration,
}: ProductDetailMobilePurchaseBarProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [heroActionsVisible, setHeroActionsVisible] = useState(true);

  useEffect(() => {
    const target = purchaseActionsRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroActionsVisible(entry?.isIntersecting ?? false);
      },
      { root: null, rootMargin: '0px', threshold: 0.15 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [purchaseActionsRef]);

  const showBar = !heroActionsVisible;
  useSetMobileBottomInset(showBar ? MOBILE_PURCHASE_BAR_HEIGHT_PX : 0);
  const hasVolumeDiscount = volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const equipmentExtrasUsd = equipmentConfiguration
    ? computeEquipmentExtrasUsd(equipmentConfiguration.options)
    : 0;
  const cartAddOptions = {
    quantity,
    ...(hasVolumeDiscount ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
    ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
  };

  const { displayCurrency } = useDisplayCurrency();

  const savingsMessage = useMemo(() => {
    if (bulkDiscountTiers.length === 0) {
      return quantity > 1 ? `Total ${quantity} ud.` : null;
    }
    const hint = resolveBulkDiscountSavingsHint(quantity, basePriceUsd, bulkDiscountTiers, {
      floorPriceUsd,
    });
    if (!hint) return quantity > 1 ? `Total ${quantity} ud.` : null;

    const pricing = resolveBulkDiscountPricing(
      hint.targetQuantity,
      basePriceUsd,
      bulkDiscountTiers,
      { floorPriceUsd },
    );
    return formatVolumeQuantityPromoMessage(
      hint.targetQuantity,
      pricing.unitUsd,
      displayCurrency,
    );
  }, [bulkDiscountTiers, quantity, basePriceUsd, floorPriceUsd, displayCurrency]);

  const totalUsd =
    (quantity > 1 || hasVolumeDiscount ? volumePricing.totalUsd : volumePricing.unitUsd) +
    equipmentExtrasUsd * quantity;

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const buyNowLabel = outOfStock ? 'Pedido' : 'Comprar';
  const addToCartLabel = getAddToCartLabel(product, 'short');

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-transform duration-200',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        showBar ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
      aria-hidden={!showBar}
    >
      <div className="container flex items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="hidden truncate text-sm font-medium text-foreground lg:block">{product.name}</p>
          <p className="truncate text-lg font-bold leading-tight text-red-600 lg:text-xl">
            <DualPrice usd={totalUsd} />
          </p>
          {savingsMessage ? (
            <p className="truncate text-xs text-muted-foreground">{savingsMessage}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-stretch gap-2">
          <AddToCartButton
            product={product}
            addOptions={cartAddOptions}
            className="min-h-11 gap-1.5 rounded-md bg-red-600 px-3 text-sm font-bold text-white hover:bg-red-500 lg:px-4"
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only sm:inline lg:inline">{addToCartLabel}</span>
          </AddToCartButton>
          <Button
            type="button"
            onClick={handleBuyNow}
            className="min-h-11 gap-1 rounded-md bg-[#0f1f3d] px-3 text-sm font-bold text-white hover:bg-[#0f1f3d]/90 lg:px-4"
            aria-label="Comprar ahora"
          >
            <Zap className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden min-[400px]:inline">{buyNowLabel}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
