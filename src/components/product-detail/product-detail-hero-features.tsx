import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight } from '@/types/product-detail';

interface ProductDetailHeroFeaturesProps {
  highlights: ProductDescriptionHighlight[];
  className?: string;
}

export function ProductDetailHeroFeatures({ highlights, className }: ProductDetailHeroFeaturesProps) {
  if (highlights.length === 0) return null;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/60 bg-white px-3 py-4 shadow-sm sm:px-5 sm:py-5',
        className,
      )}
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-0">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.title} className="flex min-w-0 flex-col items-center gap-2 text-center sm:gap-2.5">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0f1f3d] sm:size-12"
                aria-hidden="true"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="space-y-1">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.04em] text-[#0f1f3d] sm:text-[0.6875rem]">
                  {item.title}
                </p>
                <p className="text-[0.625rem] leading-snug text-muted-foreground sm:text-xs">
                  {item.subtitle}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
