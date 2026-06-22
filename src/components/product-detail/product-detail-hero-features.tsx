import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight } from '@/types/product-detail';

interface ProductDetailHeroFeaturesProps {
  highlights: ProductDescriptionHighlight[];
  className?: string;
}

export function ProductDetailHeroFeatures({ highlights, className }: ProductDetailHeroFeaturesProps) {
  if (highlights.length === 0) return null;

  return (
    <div className={cn('py-1', className)}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <li
              key={item.title}
              className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center"
            >
              <Icon
                className="size-5 shrink-0 text-[#0f1f3d] sm:size-6"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-[0.65rem] leading-snug text-muted-foreground sm:text-xs">
                {item.subtitle || item.title}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
