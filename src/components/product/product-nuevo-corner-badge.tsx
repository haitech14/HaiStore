import { cn } from '@/lib/utils';

/** Píldora compacta para ficha de producto y tarjetas destacadas. */
const PILL_BADGE_BASE =
  'inline-flex h-6 w-fit shrink-0 items-center justify-center rounded-full px-2.5 text-[0.625rem] font-bold uppercase leading-none tracking-[0.14em] antialiased sm:h-[1.625rem] sm:px-3 sm:text-[0.6875rem]';

export function ProductNuevoCornerBadge({
  variant = 'catalog',
  className,
}: {
  variant?: 'catalog' | 'highlight' | 'detail';
  className?: string;
}) {
  if (variant === 'highlight' || variant === 'detail') {
    return (
      <span
        className={cn(
          PILL_BADGE_BASE,
          'bg-red-600 text-white shadow-[0_1px_3px_rgba(220,38,38,0.28)] ring-1 ring-inset ring-white/20',
          className,
        )}
      >
        Nuevo
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center justify-center rounded-md bg-green-600 px-2 py-0.5 text-[0.7rem] font-bold text-white shadow-sm',
        className,
      )}
    >
      Nuevo
    </span>
  );
}

export function ProductBrandBadge({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        PILL_BADGE_BASE,
        'bg-[#0f1f3d] text-white shadow-[0_1px_3px_rgba(15,31,61,0.22)] ring-1 ring-inset ring-white/10',
        className,
      )}
    >
      {brand}
    </span>
  );
}
