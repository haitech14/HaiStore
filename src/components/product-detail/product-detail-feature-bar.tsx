import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight } from '@/types/product-detail';

interface ProductDetailFeatureBarProps {
  items: ProductDescriptionHighlight[];
  className?: string;
  columns?: 4 | 6;
  variant?: 'default' | 'compact';
}

export function ProductDetailFeatureBar({
  items,
  className,
  columns = 6,
  variant = 'default',
}: ProductDetailFeatureBarProps) {
  if (items.length === 0) return null;

  const isCompact = variant === 'compact';
  const gridClass = isCompact
    ? columns === 4
      ? 'grid-cols-4'
      : 'grid-cols-3 sm:grid-cols-6'
    : columns === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';

  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-border/60 bg-muted/15',
        isCompact && 'rounded-md',
        className,
      )}
      aria-label="Características destacadas del producto"
    >
      <ul className={cn('grid', gridClass)}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLastColMobile = isCompact
            ? columns === 6
              ? index % 3 === 2
              : index % 4 === 3
            : index % 2 === 1;
          const isLastColSm = columns === 4 ? index % 4 === 3 : index % 3 === 2;
          const isNotLastLg = index < items.length - 1;

          return (
            <li
              key={`${item.title}-${item.subtitle}`}
              className={cn(
                'flex flex-col items-center justify-center text-center',
                isCompact
                  ? 'gap-0.5 px-1.5 py-2 sm:gap-1 sm:px-2 sm:py-2.5'
                  : 'gap-1.5 px-3 py-3.5 sm:px-4 sm:py-4',
                !isCompact &&
                  index < items.length - 2 &&
                  columns === 6 &&
                  'border-b border-border/60 lg:border-b-0',
                !isCompact &&
                  index < items.length - (items.length % 2 === 0 ? 2 : 1) &&
                  columns === 6 &&
                  'max-sm:border-b max-sm:border-border/60',
                !isLastColMobile && 'border-r border-border/60',
                !isCompact && columns === 6 && !isLastColSm && 'sm:border-r-0',
                !isCompact && columns === 6 && isNotLastLg && 'lg:border-r lg:border-border/60',
                !isCompact && columns === 4 && !isLastColSm && 'sm:border-r sm:border-border/60',
                isCompact &&
                  columns === 6 &&
                  index % 3 !== 2 &&
                  'max-sm:border-r max-sm:border-border/60',
                isCompact &&
                  columns === 6 &&
                  index % 6 !== 5 &&
                  'sm:border-r sm:border-border/60',
                isCompact && columns === 4 && index % 4 !== 3 && 'border-r border-border/60',
              )}
            >
              <Icon
                className={cn(
                  'text-[#0f1f3d]',
                  isCompact ? 'size-3.5 sm:size-4' : 'size-5 text-muted-foreground sm:size-6',
                )}
                strokeWidth={isCompact ? 1.5 : 1.25}
                aria-hidden="true"
              />
              <p
                className={cn(
                  'font-bold leading-tight text-[#0f1f3d]',
                  isCompact ? 'text-[0.5625rem] sm:text-[0.625rem]' : 'text-xs sm:text-sm',
                )}
              >
                {item.title}
              </p>
              <p
                className={cn(
                  'leading-snug text-muted-foreground',
                  isCompact ? 'text-[0.5rem] leading-tight sm:text-[0.5625rem]' : 'text-[0.65rem] sm:text-xs',
                )}
              >
                {item.subtitle}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
