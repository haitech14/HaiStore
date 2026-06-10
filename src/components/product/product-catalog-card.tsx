import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Heart,
  ImageOff,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';

import { AddToCartButton, getAddToCartLabel, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductRating } from '@/components/product/product-rating';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { useWishlist } from '@/context/wishlist-context';
import {
  CATALOG_VOLUME_TIERS,
  formatCatalogVolumePricePen,
  getCatalogCardPricing,
  getCatalogCardRating,
  getCatalogCardSpecLines,
} from '@/lib/product-catalog-card-meta';
import { PRODUCT_CARD_DISCOUNT_CLASS } from '@/lib/product-card-title';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatProductCardTitle } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

function CatalogCardPricing({ product }: { product: Product }) {
  const pricing = getCatalogCardPricing(product);

  return (
    <div className="space-y-1">
      <div className="rounded-md border border-border/60 bg-muted/15 px-2 py-1.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-red-600/90">USD</p>
            <AdminRolePricesTooltip productId={product.id} displayUsd={pricing.currentUsd}>
              <p className="text-base font-bold tabular-nums leading-tight text-red-600 xl:text-lg">
                {formatUsd(pricing.currentUsd)}
              </p>
            </AdminRolePricesTooltip>
          </div>
          <div className="min-w-0 border-l border-border/50 pl-2">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-red-600/90">PEN</p>
            <p className="text-base font-bold tabular-nums leading-tight text-red-600 xl:text-lg">
              {formatPenFromUsd(pricing.currentUsd)}
            </p>
          </div>
        </div>
      </div>
      {pricing.discountPercent > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-0.5">
          <p className="text-[0.65rem] tabular-nums text-muted-foreground line-through sm:text-xs">
            {formatUsd(pricing.compareUsd)} · {formatPenFromUsd(pricing.compareUsd)}
          </p>
          <span className={PRODUCT_CARD_DISCOUNT_CLASS} aria-label={`Ahorra ${pricing.discountPercent} por ciento`}>
            -{pricing.discountPercent}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

function CatalogVolumePricing({ priceUsd }: { priceUsd: number }) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/30 px-2 py-1.5">
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted-foreground">
        Precios por volumen (desde 3 u.)
      </p>
      <ul className="mt-1 space-y-0.5">
        {CATALOG_VOLUME_TIERS.map((tier) => (
          <li key={tier.range} className="flex items-center justify-between gap-1 text-[0.65rem]">
            <span className="text-muted-foreground">{tier.range}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatCatalogVolumePricePen(priceUsd, tier.discountPercent)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CatalogCardSpecList({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null;

  return (
    <ul className="space-y-0.5" aria-label="Especificaciones del equipo">
      {lines.map((line) => (
        <li
          key={line}
          className="flex items-start gap-1.5 text-[0.65rem] leading-snug text-muted-foreground sm:text-xs"
        >
          <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="text-pretty">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function CatalogCardStockLine({
  outOfStock,
  stock,
  productCode,
}: {
  outOfStock: boolean;
  stock: number;
  productCode: string | null;
}) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-tight sm:text-sm',
        outOfStock ? 'text-orange-600' : 'text-emerald-700',
      )}
    >
      <span className="inline-flex items-center gap-1 font-semibold">
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
        {outOfStock ? 'A pedido' : `Stock: ${stock}`}
      </span>
      {productCode ? (
        <>
          <span className="text-muted-foreground" aria-hidden="true">
            |
          </span>
          <span className="font-medium text-foreground">
            Código: <span className="font-mono">{productCode}</span>
          </span>
        </>
      ) : null}
    </p>
  );
}

interface ProductCatalogCardProps {
  product: Product;
}

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product.id);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = imageFailed ? null : resolveProductImageUrl(product, { stockFallback: false });
  const wishlistSelected = isWishlisted(product.id);
  const stockQty = outOfStock ? 0 : Math.max(product.stock, 1);
  const displayTitle = formatProductCardTitle(product);
  const productCode = product.code?.trim() || null;
  const rating = getCatalogCardRating(product);
  const specLines = getCatalogCardSpecLines(product);
  const cartLabel = outOfStock ? getAddToCartLabel(product) : getAddToCartLabel(product, 'detail');
  const whatsAppProduct = {
    id: product.id,
    name: product.name,
    priceUsd: product.price,
    category: product.category,
    brand: product.brand ?? null,
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(stockQty || 99, current + delta)));
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative px-2 pb-1.5 pt-2">
        <button
          type="button"
          aria-pressed={wishlistSelected}
          aria-label={
            wishlistSelected
              ? `Quitar ${product.name} de favoritos`
              : `Añadir ${product.name} a favoritos`
          }
          className={cn(
            'absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full border bg-card shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            wishlistSelected
              ? 'border-red-600 bg-red-50 text-red-600'
              : 'border-border text-muted-foreground hover:border-red-200 hover:text-red-600',
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(productToWishlistItem(product));
          }}
        >
          <Heart
            className={cn('size-4', wishlistSelected && 'fill-red-600 text-red-600')}
            aria-hidden="true"
          />
        </button>

        <Link
          to={detailHref}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label={`Ver ficha de ${product.name}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="size-full object-contain object-center p-0.5"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden="true" />
              <span className="text-xs font-medium">Imagen no disponible</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2 pb-2">
        <Link
          to={detailHref}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-sm font-bold leading-snug text-foreground sm:text-base">
            {displayTitle}
          </h3>
        </Link>

        <ProductRating rating={rating.rating} reviews={rating.reviews} className="-mt-0.5" />

        <CatalogCardStockLine
          outOfStock={outOfStock}
          stock={product.stock}
          productCode={productCode}
        />

        <CatalogCardSpecList lines={specLines} />

        <CatalogCardPricing product={product} />

        <div
          className={cn(
            'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200',
            'group-hover:grid-rows-[1fr] group-hover:opacity-100',
            'group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
            'motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <CatalogVolumePricing priceUsd={product.price} />
          </div>
        </div>

        <div className="mt-auto pt-1.5">
          {outOfStock ? (
            <div className="grid gap-1.5">
              <ProductWhatsAppButton
                product={whatsAppProduct}
                label="Cotizar ahora"
                className="w-full min-h-9"
              />
              <AddToCartButton
                product={product}
                addOptions={{ quantity }}
                className="min-h-9 w-full gap-1 rounded-md border border-red-600/30 bg-background px-2 text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:ring-red-600"
              >
                <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{cartLabel}</span>
              </AddToCartButton>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-stretch gap-1">
              <div className="flex items-center rounded-md border border-border bg-muted/30">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
                >
                  <Minus className="size-3" aria-hidden="true" />
                </button>
                <span
                  className="min-w-[1.5rem] text-center text-xs font-semibold tabular-nums text-foreground"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= (stockQty || 99)}
                  aria-label="Aumentar cantidad"
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
                >
                  <Plus className="size-3" aria-hidden="true" />
                </button>
              </div>

              <AddToCartButton
                product={product}
                addOptions={{ quantity }}
                className="min-h-9 gap-1 rounded-md bg-red-600 px-1.5 text-[0.65rem] font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 xl:text-xs"
              >
                <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{cartLabel}</span>
              </AddToCartButton>

              <ProductWhatsAppButton
                className="size-9 min-h-9 shrink-0 rounded-md border-[#25D366] bg-[#25D366] text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
                product={whatsAppProduct}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
