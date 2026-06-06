import { useMemo } from 'react';

import { CategoryHeroBanner } from '@/components/category-hero-banner';
import { getCategoryHeroContent, type ResolvedCategoryHero } from '@/data/category-hero';
import { resolveSubcategoryHeroImage } from '@/lib/subcategory-product-image';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

interface SubcategoryHeroBannersProps {
  parentName: string;
  parentSlug: string;
  parentTagline: string;
  parentImage?: string | null;
  parentHero?: ResolvedCategoryHero;
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  products?: Product[];
  onSelectSub: (subSlug: string | null) => void;
}

function buildSubcategoryHero(
  sub: StoreCategoryTreeNode,
  image: string,
  parentName: string,
): ResolvedCategoryHero {
  const productCount = sub.productCount ?? 0;

  return {
    title: sub.name,
    subtitle:
      sub.tagline?.trim() ||
      `Explora productos de ${sub.name} dentro de ${parentName}.`,
    image,
    imageAlt: `Productos de ${sub.name}`,
    features: [],
    ...(productCount > 0
      ? { badge: `${productCount} producto${productCount === 1 ? '' : 's'}` }
      : {}),
  };
}

export function SubcategoryHeroBanners({
  parentName,
  parentSlug,
  parentTagline,
  parentImage,
  parentHero,
  subcategories,
  activeSubSlug,
  products = [],
  onSelectSub,
}: SubcategoryHeroBannersProps) {
  const allHero = useMemo<ResolvedCategoryHero>(() => {
    if (parentHero) {
      return {
        ...parentHero,
        title: parentName,
        subtitle: parentTagline,
        badge: 'Ver todo',
      };
    }

    return getCategoryHeroContent(parentSlug, {
      name: parentName,
      tagline: parentTagline,
      ...(parentImage ? { image: parentImage } : {}),
    });
  }, [parentHero, parentName, parentSlug, parentTagline, parentImage]);

  const subcategoryHeroes = useMemo(() => {
    return subcategories.map((sub) => {
      const image = resolveSubcategoryHeroImage(
        {
          name: sub.name,
          slug: sub.slug,
          image: sub.image ?? null,
          inventoryLabels: sub.inventoryLabels,
        },
        products,
        parentImage,
      );

      return {
        sub,
        content: buildSubcategoryHero(sub, image, parentName),
      };
    });
  }, [subcategories, products, parentImage, parentName, allHero.image]);

  if (subcategories.length === 0) return null;

  const { promoCard: _promoCard, ...verTodoBase } = allHero;
  const verTodoContent: ResolvedCategoryHero = {
    ...verTodoBase,
    title: `Todo ${parentName}`,
    subtitle: parentTagline,
    badge: 'Ver todo',
    features: [],
  };

  const columnCount = 1 + subcategories.length;

  return (
    <section aria-labelledby="subcategorias-hero-titulo" className="space-y-4">
      <h2
        id="subcategorias-hero-titulo"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Subcategorías
      </h2>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
        <div
          className="grid min-w-max gap-3 sm:min-w-0 sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(11rem, 1fr))` }}
          role="list"
        >
          <div className="min-w-0" role="listitem">
            <CategoryHeroBanner
              content={verTodoContent}
              interactive
              selected={activeSubSlug === null}
              onActivate={() => onSelectSub(null)}
              headingLevel="h2"
              inline
            />
          </div>

          {subcategoryHeroes.map(({ sub, content }) => (
            <div key={sub.id} className="min-w-0" role="listitem">
              <CategoryHeroBanner
                content={content}
                interactive
                selected={activeSubSlug === sub.slug}
                onActivate={() => onSelectSub(sub.slug)}
                headingLevel="h2"
                inline
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
