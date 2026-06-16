import { useEffect, useMemo, useState } from 'react';

import { ProductDetailBreadcrumbs } from '@/components/product-detail/product-detail-breadcrumbs';
import { ProductDetailCombo } from '@/components/product-detail/product-detail-combo';
import { ProductDetailEquipmentConfig } from '@/components/product-detail/product-detail-equipment-config';
import { ProductDetailGallery } from '@/components/product-detail/product-detail-gallery';
import { ProductDetailHeroInfo } from '@/components/product-detail/product-detail-hero-info';
import { ProductDetailRentalBanner } from '@/components/product-detail/product-detail-rental-banner';
import { ProductDetailRelated } from '@/components/product-detail/product-detail-related';
import { ProductDetailSpecsTable } from '@/components/product-detail/product-detail-specs-table';
import { productHasNuevoCornerBadge } from '@/lib/product-detail-badges';
import { buildProductDetail } from '@/lib/build-product-detail';
import { buildProductBreadcrumbs } from '@/lib/build-product-breadcrumbs';
import {
  resolveAccessoryProducts,
  resolveEquipmentConfigSteps,
} from '@/lib/equipment-config-catalog';
import {
  buildInitialEquipmentSelection,
  computeEquipmentExtrasPen,
  resolveSelectedEquipmentOptions,
} from '@/lib/equipment-config-selection';
import { resolveFrequentlyBoughtItems } from '@/lib/product-compatible-toners';
import { useRentalPlans } from '@/hooks/use-rental-plans';
import { useProducts } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';
import type { CartConfigurationLine } from '@/types/product';
import type { FeaturedProduct } from '@/data/featured-products';
import type { Product } from '@/types/product';

type DetailTab = 'description' | 'specs' | 'reviews';

interface ProductDetailViewProps {
  product: Product;
  featuredMeta?: FeaturedProduct | undefined;
}

const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Carlos M.',
    city: 'Lima',
    rating: 5,
    text: 'Excelente equipo, llegó a tiempo y la instalación fue muy profesional.',
  },
  {
    id: '2',
    author: 'María G.',
    city: 'Arequipa',
    rating: 5,
    text: 'Muy buena calidad de impresión y el soporte técnico respondió rápido.',
  },
  {
    id: '3',
    author: 'Luis R.',
    city: 'Trujillo',
    rating: 4,
    text: 'Ideal para nuestra oficina. Fácil de usar y confiable.',
  },
];

export function ProductDetailView({ product, featuredMeta }: ProductDetailViewProps) {
  const { data: rentalPlansRaw = [] } = useRentalPlans({ activeOnly: true });
  const { data: catalogProducts = [] } = useProducts();
  const rentalPlansFromApi = rentalPlansRaw.map((plan) => ({
    pagesPerMonth: plan.pagesPerMonth,
    monthlyPricePen: plan.monthlyPricePen,
  }));
  const detail = buildProductDetail(product, featuredMeta, rentalPlansFromApi);
  const frequentlyBought = useMemo(
    () => resolveFrequentlyBoughtItems(product, catalogProducts),
    [product, catalogProducts],
  );
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const breadcrumbs = useMemo(
    () => buildProductBreadcrumbs(product, detail.displayTitle, categoryTree),
    [product, detail.displayTitle, categoryTree],
  );
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const descriptionText =
    detail.descriptionContent?.paragraphs.join(' ') ??
    detail.bullets.slice(0, 2).join(' ');

  const tabs = [
    { id: 'description' as const, label: 'Descripción' },
    { id: 'specs' as const, label: 'Especificaciones' },
    { id: 'reviews' as const, label: `Opiniones (${detail.reviews})` },
  ];

  const equipmentSteps = useMemo(
    () => resolveEquipmentConfigSteps(detail.equipmentConfigSteps, catalogProducts, product),
    [detail.equipmentConfigSteps, catalogProducts, product],
  );

  const [equipmentSelection, setEquipmentSelection] = useState(() =>
    buildInitialEquipmentSelection(equipmentSteps),
  );

  useEffect(() => {
    setEquipmentSelection(buildInitialEquipmentSelection(equipmentSteps));
  }, [product.id, equipmentSteps]);

  const selectedEquipmentOptions = useMemo(
    () => resolveSelectedEquipmentOptions(equipmentSteps, equipmentSelection),
    [equipmentSteps, equipmentSelection],
  );

  const equipmentConfiguration = useMemo<CartConfigurationLine | undefined>(() => {
    if (selectedEquipmentOptions.length === 0) return undefined;
    return {
      options: selectedEquipmentOptions,
      extrasPen: computeEquipmentExtrasPen(selectedEquipmentOptions),
    };
  }, [selectedEquipmentOptions]);

  const accessoryProducts = useMemo(
    () => resolveAccessoryProducts(selectedEquipmentOptions, catalogProducts),
    [selectedEquipmentOptions, catalogProducts],
  );

  const showBottomRow =
    detail.isPrinterEquipment &&
    (frequentlyBought.length > 0 || equipmentSteps.length > 0);

  const heroGridClass =
    'grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12';

  return (
    <div className="bg-white">
      <div className="container py-4 sm:py-6">
        <ProductDetailBreadcrumbs items={breadcrumbs} />

        <div className={heroGridClass}>
          <ProductDetailGallery
            items={detail.gallery}
            productName={product.name}
            showNuevo={productHasNuevoCornerBadge(product)}
          />
          <ProductDetailHeroInfo
            product={product}
            detail={detail}
            equipmentConfiguration={equipmentConfiguration}
            accessoryProducts={accessoryProducts}
          />
        </div>

        {showBottomRow ? (
          <div className={cn(heroGridClass, 'mt-6 items-start sm:mt-8')}>
            <div className="min-w-0">
              {frequentlyBought.length > 0 ? (
                <ProductDetailCombo
                  items={frequentlyBought}
                  mainProduct={product}
                  catalogProducts={catalogProducts}
                  title="Suelen comprar frecuentemente"
                  subtitle={`Toner y consumibles compatibles con ${detail.shortTitle}`}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              {equipmentSteps.length > 0 ? (
                <ProductDetailEquipmentConfig
                  steps={equipmentSteps}
                  selection={equipmentSelection}
                  onSelectionChange={setEquipmentSelection}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {detail.isPrinterEquipment && detail.rentalPlans.length > 0 ? (
          <ProductDetailRentalBanner
            product={product}
            plans={detail.rentalPlans}
            className="mt-6 sm:mt-8"
          />
        ) : null}

        <section
          className="mt-10 border-t border-border/60 pt-6 sm:mt-12"
          aria-label="Información del producto"
        >
          <div className="border-b border-border/60">
            <div
              role="tablist"
              aria-label="Secciones del producto"
              className="flex gap-6 overflow-x-auto sm:gap-8"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 border-b-2 pb-3 text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                    activeTab === tab.id
                      ? 'border-red-600 text-[#0f1f3d]'
                      : 'border-transparent text-muted-foreground hover:text-[#0f1f3d]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="pt-6"
          >
            {activeTab === 'description' ? (
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p className={cn(!descriptionExpanded && 'line-clamp-6')}>{descriptionText}</p>
                  {descriptionText.length > 280 ? (
                    <button
                      type="button"
                      onClick={() => setDescriptionExpanded((value) => !value)}
                      className="text-sm font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  ) : null}
                </div>
                <ProductDetailSpecsTable specs={detail.specs} />
              </div>
            ) : null}

            {activeTab === 'specs' ? (
              <div className="max-w-3xl">
                <ProductDetailSpecsTable specs={detail.specs} />
              </div>
            ) : null}

            {activeTab === 'reviews' ? (
              <ul className="grid max-w-3xl gap-4">
                {MOCK_REVIEWS.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-border/60 bg-muted/15 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#0f1f3d]">
                        {review.author}
                        <span className="font-normal text-muted-foreground"> · {review.city}</span>
                      </p>
                      <p className="text-xs font-semibold text-red-600" aria-label={`${review.rating} de 5 estrellas`}>
                        {'★'.repeat(review.rating)}
                        <span className="text-muted-foreground/40">{'★'.repeat(5 - review.rating)}</span>
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <ProductDetailRelated product={product} />
      </div>
    </div>
  );
}
