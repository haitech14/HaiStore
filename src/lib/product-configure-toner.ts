import { formatYieldLabel } from '@/lib/product-cost-per-copy';
import {
  isCrossSellEligibleProduct,
  resolveKnownOriginalTonerProductId,
  resolveTonerSupplyTypeFromProduct,
  normalizeMerchandisingProductIds,
} from '@/lib/product-merchandising';
import {
  flattenConsumableGroupItems,
  splitTonerItemsBySupplyType,
  type ConsumableGroup,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { ensureFullPrices, type ProductRolePrices } from '@/lib/roles';
import { penToUsd, usdToPen } from '@/lib/utils';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

export type ConfigureTonerSupplyType = 'original' | 'compatible';

interface TonerCardBuildOptions {
  allowZeroPrice?: boolean;
}

function shouldSkipZeroPriceCard(
  pricePen: number,
  priceUsd: number,
  options?: TonerCardBuildOptions,
): boolean {
  return !options?.allowZeroPrice && pricePen <= 0 && priceUsd <= 0;
}

export interface ConfigureTonerCard {
  supplyType: ConfigureTonerSupplyType;
  title: string;
  optionId: string;
  productId: string;
  name: string;
  description: string;
  image: string;
  imageCandidates: string[];
  pricePen: number;
  priceUsd: number;
  prices: ProductRolePrices;
}

const GENERIC_TONER_IMAGES = new Set([
  '/categories/toner-suministros.png',
  '/products/toner-418480.webp',
  '/products/toner-419078.webp',
]);

function isGenericTonerImage(image: string | undefined): boolean {
  if (!image) return false;
  return GENERIC_TONER_IMAGES.has(image);
}

function resolveTonerProductImageCandidates(
  productId: string,
  catalog: Product[],
  itemImage: string | null,
): string[] {
  const product = catalog.find((row) => row.id === productId);
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(itemImage);
  if (product) {
    for (const url of buildProductImageCandidates(product, { stockFallback: true })) {
      push(url);
    }
  }

  return candidates;
}

function resolveTonerCardMedia(
  productId: string,
  catalog: Product[],
  itemImage: string | null,
  optionImage: string | undefined,
  fallbackImage: string,
): { image: string; imageCandidates: string[] } {
  const candidates = resolveTonerProductImageCandidates(productId, catalog, itemImage);

  if (optionImage && !isGenericTonerImage(optionImage)) {
    if (!candidates.includes(optionImage)) {
      candidates.push(optionImage);
    }
  }

  if (candidates.length === 0) {
    return { image: fallbackImage, imageCandidates: [fallbackImage] };
  }

  return { image: candidates[0], imageCandidates: candidates };
}

function isCompatibleOption(option: EquipmentConfigOption): boolean {
  const haystack = `${option.id} ${option.name}`.toLowerCase();
  return haystack.includes('compatible') || haystack.includes('alternativ');
}

function consumableToOption(item: ConsumableItem, supplyType: ConfigureTonerSupplyType): EquipmentConfigOption {
  const priceUsd = ensureFullPrices({ public: item.priceUsd }).public;
  const yieldText = formatYieldLabel(item.yieldPages ?? null, item.yieldLabel ?? null);
  const description =
    yieldText !== '—' ? yieldText : supplyType === 'compatible' ? 'Rendimiento según modelo' : 'Cartucho original';

  return {
    id: `toner-${supplyType}-${item.productId}`,
    productId: item.productId,
    name: item.name,
    ...(description ? { description } : {}),
    pricePen: usdToPen(priceUsd),
    priceUsd,
    ...(item.image ? { image: item.image } : {}),
    ...(item.sku ? { sku: item.sku } : {}),
  };
}

function findMatchingOption(
  options: EquipmentConfigOption[],
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption | undefined {
  const byProductId = options.find((option) => option.productId === item.productId);
  if (byProductId) return byProductId;

  if (supplyType === 'compatible') {
    return options.find((option) => !option.included && isCompatibleOption(option));
  }

  return options.find(
    (option) =>
      !option.included &&
      !isCompatibleOption(option) &&
      (option.productId != null || /^toner-ricoh/i.test(option.id)),
  );
}

function mergeOptionFromConsumable(
  existing: EquipmentConfigOption | undefined,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption {
  const fromInventory = consumableToOption(item, supplyType);
  if (!existing) return fromInventory;

  const keepIncludedFree = Boolean(existing.included);
  const resolvedImage =
    item.image ??
    (existing.image && !isGenericTonerImage(existing.image) ? existing.image : undefined);

  return {
    ...existing,
    productId: item.productId,
    name: item.name.trim() ? item.name : existing.name,
    ...(fromInventory.description ? { description: fromInventory.description } : {}),
    pricePen: keepIncludedFree ? 0 : fromInventory.pricePen,
    ...(keepIncludedFree
      ? { priceUsd: 0 }
      : fromInventory.priceUsd != null
        ? { priceUsd: fromInventory.priceUsd }
        : {}),
    ...(resolvedImage ? { image: resolvedImage } : {}),
    ...((item.sku ?? existing.sku) ? { sku: item.sku ?? existing.sku } : {}),
  };
}

function syncOptionFromInventory(
  option: EquipmentConfigOption,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption {
  const fromInventory = consumableToOption(item, supplyType);
  const resolvedImage =
    item.image ??
    (option.image && !isGenericTonerImage(option.image) ? option.image : undefined);
  const keepIncludedFree = Boolean(option.included);

  return {
    ...option,
    productId: item.productId,
    name: item.name,
    ...(fromInventory.description ? { description: fromInventory.description } : {}),
    pricePen: keepIncludedFree ? 0 : fromInventory.pricePen,
    ...(keepIncludedFree
      ? { priceUsd: 0 }
      : fromInventory.priceUsd != null
        ? { priceUsd: fromInventory.priceUsd }
        : {}),
    ...(resolvedImage ? { image: resolvedImage } : {}),
    ...(item.sku ?? option.sku ? { sku: item.sku ?? option.sku } : {}),
  };
}

function resolvePurchasableOptionForInventoryItem(
  tonerStep: EquipmentConfigStep,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption {
  const purchasableByProduct = tonerStep.options.find(
    (option) => !option.included && option.productId === item.productId,
  );
  if (purchasableByProduct) {
    return syncOptionFromInventory(purchasableByProduct, item, supplyType);
  }

  const bySupplyType = tonerStep.options.find((option) => {
    if (option.included) return false;
    return supplyType === 'compatible'
      ? isCompatibleOption(option)
      : !isCompatibleOption(option);
  });
  if (bySupplyType) {
    return syncOptionFromInventory(bySupplyType, item, supplyType);
  }

  return consumableToOption(item, supplyType);
}

/** Enriquece el paso de tóner con original y compatible del inventario (precio, imagen, rendimiento). */
export function mergeConsumableTonerOptions(
  steps: EquipmentConfigStep[],
  consumableGroups: ConsumableGroup[],
): EquipmentConfigStep[] {
  const tonerGroup = consumableGroups.find((group) => group.id === 'toner');
  if (!tonerGroup) return steps;

  const tonerItems = flattenConsumableGroupItems([tonerGroup]);
  const { original, compatible } = splitTonerItemsBySupplyType(tonerItems);
  const primaryOriginal = original[0] ?? null;
  const primaryCompatible = compatible[0] ?? null;

  if (!primaryOriginal && !primaryCompatible) return steps;

  return steps.map((step) => {
    if (step.id !== 'toner') return step;

    let options = [...step.options];

    if (primaryOriginal) {
      const existing = findMatchingOption(options, primaryOriginal, 'original');

      if (existing?.included) {
        const starter = mergeOptionFromConsumable(existing, primaryOriginal, 'original');
        options = options.filter((option) => option.id !== starter.id);
        options.push(starter);

        const purchasable = consumableToOption(primaryOriginal, 'original');
        if (!options.some((option) => option.id === purchasable.id)) {
          options.push(purchasable);
        }
      } else {
        const merged = mergeOptionFromConsumable(existing, primaryOriginal, 'original');
        options = options.filter((option) => option.id !== merged.id);
        options.push(merged);
      }
    }

    if (primaryCompatible) {
      const existing = findMatchingOption(options, primaryCompatible, 'compatible');
      const merged = mergeOptionFromConsumable(existing, primaryCompatible, 'compatible');
      options = options.filter((option) => option.id !== merged.id);
      options.push(merged);
    }

    return { ...step, options };
  });
}

function resolveTonerProductPrices(
  productId: string,
  catalog: Product[],
  fallbackUsd: number,
): ProductRolePrices {
  const product = catalog.find((row) => row.id === productId);
  if (!product) {
    return ensureFullPrices({ public: fallbackUsd });
  }
  return ensureFullPrices(product.prices ?? { public: product.price });
}

function optionToCard(
  option: EquipmentConfigOption,
  supplyType: ConfigureTonerSupplyType,
  catalog: Product[],
  fallbackImage: string,
  buildOptions?: TonerCardBuildOptions,
): ConfigureTonerCard | null {
  if (option.included || !option.productId) return null;

  const prices = resolveTonerProductPrices(
    option.productId,
    catalog,
    option.priceUsd ?? penToUsd(option.pricePen),
  );
  const priceUsd = prices.public;
  const pricePen = usdToPen(priceUsd);
  if (shouldSkipZeroPriceCard(pricePen, priceUsd, buildOptions)) return null;

  const media = resolveTonerCardMedia(
    option.productId,
    catalog,
    null,
    option.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: supplyType === 'original' ? 'Original' : 'Compatible',
    optionId: option.id,
    productId: option.productId,
    name: option.name,
    description: option.description?.trim() || 'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
    prices,
  };
}

function inventoryItemToCard(
  tonerStep: EquipmentConfigStep,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
  catalog: Product[],
  fallbackImage: string,
  buildOptions?: TonerCardBuildOptions,
): ConfigureTonerCard | null {
  const option = resolvePurchasableOptionForInventoryItem(tonerStep, item, supplyType);
  const prices = resolveTonerProductPrices(item.productId, catalog, item.priceUsd);
  const priceUsd = prices.public;
  const pricePen = usdToPen(priceUsd);
  if (shouldSkipZeroPriceCard(pricePen, priceUsd, buildOptions)) return null;

  const media = resolveTonerCardMedia(
    item.productId,
    catalog,
    item.image,
    option.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: supplyType === 'original' ? 'Original' : 'Compatible',
    optionId: option.id,
    productId: item.productId,
    name: item.name,
    description: option.description?.trim() || 'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
    prices,
  };
}

function catalogProductToTonerCard(
  product: Product,
  supplyType: ConfigureTonerSupplyType,
  tonerStep: EquipmentConfigStep,
  fallbackImage: string,
  buildOptions?: TonerCardBuildOptions,
): ConfigureTonerCard | null {
  const prices = resolveTonerProductPrices(product.id, [product], product.price);
  const priceUsd = prices.public;
  const pricePen = usdToPen(priceUsd);
  if (shouldSkipZeroPriceCard(pricePen, priceUsd, buildOptions)) return null;

  const matchingOption = tonerStep.options.find((option) => option.productId === product.id);
  const optionId = matchingOption?.id ?? `toner-${supplyType}-${product.id}`;

  const media = resolveTonerCardMedia(
    product.id,
    [product],
    null,
    matchingOption?.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: supplyType === 'original' ? 'Original' : 'Compatible',
    optionId,
    productId: product.id,
    name: product.name,
    description:
      matchingOption?.description?.trim() ||
      product.description?.trim() ||
      'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
    prices,
  };
}

function pushUniqueTonerCard(
  cards: ConfigureTonerCard[],
  seenProductIds: Set<string>,
  card: ConfigureTonerCard | null,
): void {
  if (!card || seenProductIds.has(card.productId)) return;
  seenProductIds.add(card.productId);
  cards.push(card);
}

function sortTonerCards(cards: ConfigureTonerCard[]): ConfigureTonerCard[] {
  return [...cards].sort((a, b) => {
    if (a.supplyType === b.supplyType) return a.name.localeCompare(b.name, 'es');
    return a.supplyType === 'original' ? -1 : 1;
  });
}

function mergeTonerCardsPreferPrimary(
  primary: ConfigureTonerCard[],
  fallback: ConfigureTonerCard[],
): ConfigureTonerCard[] {
  const merged = [...primary];
  const seen = new Set(primary.map((card) => card.productId));
  const hasOriginal = () => merged.some((card) => card.supplyType === 'original');
  const hasCompatible = () => merged.some((card) => card.supplyType === 'compatible');

  for (const card of fallback) {
    if (seen.has(card.productId)) continue;
    if (card.supplyType === 'original' && hasOriginal()) continue;
    if (card.supplyType === 'compatible' && hasCompatible()) continue;
    seen.add(card.productId);
    merged.push(card);
  }

  return sortTonerCards(merged);
}

function buildCrossSellTonerCards(
  tonerStep: EquipmentConfigStep,
  equipment: Product,
  catalog: Product[],
  fallbackImage: string,
): ConfigureTonerCard[] {
  const cards: ConfigureTonerCard[] = [];
  const seenProductIds = new Set<string>();
  const buildOptions: TonerCardBuildOptions = { allowZeroPrice: true };

  for (const productId of normalizeMerchandisingProductIds(equipment.cross_sell_product_ids)) {
    const catalogProduct = catalog.find((row) => row.id === productId);
    if (!catalogProduct || !isCrossSellEligibleProduct(catalogProduct)) continue;

    const supplyType = resolveTonerSupplyTypeFromProduct(catalogProduct);
    pushUniqueTonerCard(
      cards,
      seenProductIds,
      catalogProductToTonerCard(
        catalogProduct,
        supplyType,
        tonerStep,
        fallbackImage,
        buildOptions,
      ),
    );
  }

  return cards;
}

function resolveAutoConfigureTonerCards(
  tonerStep: EquipmentConfigStep,
  consumableGroups: ConsumableGroup[],
  fallbackImage: string,
  catalog: Product[],
  equipment?: Product,
): ConfigureTonerCard[] {
  const cards: ConfigureTonerCard[] = [];
  const seenProductIds = new Set<string>();

  const tonerGroup = consumableGroups.find((group) => group.id === 'toner');
  if (tonerGroup) {
    const { original, compatible } = splitTonerItemsBySupplyType(
      flattenConsumableGroupItems([tonerGroup]),
    );

    pushUniqueTonerCard(
      cards,
      seenProductIds,
      original[0]
        ? inventoryItemToCard(tonerStep, original[0], 'original', catalog, fallbackImage)
        : null,
    );
    pushUniqueTonerCard(
      cards,
      seenProductIds,
      compatible[0]
        ? inventoryItemToCard(tonerStep, compatible[0], 'compatible', catalog, fallbackImage)
        : null,
    );
  }

  const hasOriginal = () => cards.some((card) => card.supplyType === 'original');
  const hasCompatible = () => cards.some((card) => card.supplyType === 'compatible');

  for (const option of tonerStep.options) {
    if (!option.productId) continue;
    const supplyType = isCompatibleOption(option) ? 'compatible' : 'original';
    if (supplyType === 'original' && hasOriginal()) continue;
    if (supplyType === 'compatible' && hasCompatible()) continue;

    const catalogProduct = catalog.find((row) => row.id === option.productId);
    if (catalogProduct) {
      pushUniqueTonerCard(
        cards,
        seenProductIds,
        catalogProductToTonerCard(catalogProduct, supplyType, tonerStep, fallbackImage),
      );
      continue;
    }

    if (!option.included) {
      pushUniqueTonerCard(
        cards,
        seenProductIds,
        optionToCard(option, supplyType, catalog, fallbackImage),
      );
    }
  }

  if (equipment && !hasOriginal()) {
    const knownOriginalId = resolveKnownOriginalTonerProductId(equipment);
    if (knownOriginalId) {
      const catalogProduct = catalog.find((row) => row.id === knownOriginalId);
      if (catalogProduct) {
        pushUniqueTonerCard(
          cards,
          seenProductIds,
          catalogProductToTonerCard(catalogProduct, 'original', tonerStep, fallbackImage),
        );
      }
    }
  }

  if (cards.length > 0) return sortTonerCards(cards);

  const purchasable = tonerStep.options.filter((option) => !option.included);
  const compatibleOption = purchasable.find((option) => isCompatibleOption(option));
  const originalOption = purchasable.find((option) => !isCompatibleOption(option));

  if (originalOption) {
    pushUniqueTonerCard(
      cards,
      seenProductIds,
      optionToCard(originalOption, 'original', catalog, fallbackImage),
    );
  }

  if (compatibleOption) {
    pushUniqueTonerCard(
      cards,
      seenProductIds,
      optionToCard(compatibleOption, 'compatible', catalog, fallbackImage),
    );
  }

  return sortTonerCards(cards);
}

/** Añade opciones de tóner del inventario según venta cruzada configurada en admin. */
export function mergeCrossSellTonerOptions(
  steps: EquipmentConfigStep[],
  equipment: Product,
  catalog: Product[] = [],
): EquipmentConfigStep[] {
  const ids = normalizeMerchandisingProductIds(equipment.cross_sell_product_ids);
  if (ids.length === 0) return steps;

  return steps.map((step) => {
    if (step.id !== 'toner') return step;

    const options = [...step.options];
    for (const productId of ids) {
      const product = catalog.find((row) => row.id === productId);
      if (!product || !isCrossSellEligibleProduct(product)) continue;

      const supplyType = resolveTonerSupplyTypeFromProduct(product);
      const optionId = `toner-${supplyType}-${productId}`;
      if (options.some((option) => option.id === optionId || option.productId === productId)) {
        continue;
      }

      const prices = ensureFullPrices(product.prices ?? { public: product.price });
      const priceUsd = prices.public;
      const description = product.description?.trim();
      options.push({
        id: optionId,
        productId,
        name: product.name,
        pricePen: usdToPen(priceUsd),
        priceUsd,
        ...(description ? { description } : {}),
        ...(product.image_url ? { image: product.image_url } : {}),
      });
    }

    return { ...step, options };
  });
}

export function resolveConfigureTonerCards(
  tonerStep: EquipmentConfigStep | undefined,
  consumableGroups: ConsumableGroup[],
  fallbackImage: string,
  catalog: Product[] = [],
  equipment?: Product,
): ConfigureTonerCard[] {
  if (!tonerStep) return [];

  const crossSellIds = normalizeMerchandisingProductIds(equipment?.cross_sell_product_ids);
  const autoCards = resolveAutoConfigureTonerCards(
    tonerStep,
    consumableGroups,
    fallbackImage,
    catalog,
    equipment,
  );

  if (crossSellIds.length > 0 && equipment) {
    const crossSellCards = buildCrossSellTonerCards(
      tonerStep,
      equipment,
      catalog,
      fallbackImage,
    );
    if (crossSellCards.length > 0) {
      return mergeTonerCardsPreferPrimary(crossSellCards, autoCards);
    }
  }

  return autoCards;
}
