import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ResolvedCategoryHero } from '@/data/category-hero';

interface CategoryHeroBannerProps {
  content: ResolvedCategoryHero;
}

export function CategoryHeroBanner({ content }: CategoryHeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
      role="region"
      aria-label={`${content.title}`}
    >
      <div className="relative flex min-h-[168px] flex-col justify-end sm:min-h-[212px] lg:min-h-[248px]">
        <img
          src={content.image}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/25 sm:via-black/60 sm:to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex max-w-xl flex-col gap-2 p-4 sm:gap-2.5 sm:p-6 lg:p-7">
          {content.badge && (
            <span className="inline-flex w-fit rounded-md bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:px-2.5 sm:py-1 sm:text-xs">
              {content.badge}
            </span>
          )}
          <h1 className="text-balance text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            {content.title}
          </h1>
          <p className="text-pretty text-xs leading-snug text-white/85 sm:text-sm">
            {content.subtitle}
          </p>
          {content.ctaLabel && content.ctaHref && (
            <div className="pt-0.5">
              <Button
                asChild
                className="h-10 gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                <Link to={content.ctaHref}>
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  {content.ctaLabel}
                </Link>
              </Button>
            </div>
          )}
          <span className="sr-only">{content.imageAlt}</span>
        </div>
      </div>
    </div>
  );
}
