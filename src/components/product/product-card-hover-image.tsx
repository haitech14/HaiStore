import { useMemo, useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { cn } from '@/lib/utils';

interface ProductCardHoverImageProps {
  candidates: string[];
  alt?: string;
  className?: string;
  imageClassName?: string;
  placeholder?: ReactNode;
}

export function ProductCardHoverImage({
  candidates,
  alt = '',
  className,
  imageClassName,
  placeholder,
}: ProductCardHoverImageProps) {
  const [failedIndices, setFailedIndices] = useState<Set<number>>(() => new Set());

  const displayIndex = useMemo(() => {
    for (let index = 0; index < candidates.length; index += 1) {
      if (!failedIndices.has(index)) return index;
    }
    return -1;
  }, [candidates, failedIndices]);

  const hoverIndex = useMemo(() => {
    if (displayIndex < 0) return -1;
    for (let index = 0; index < candidates.length; index += 1) {
      if (index !== displayIndex && !failedIndices.has(index)) return index;
    }
    return -1;
  }, [candidates, displayIndex, failedIndices]);

  const primarySrc = displayIndex >= 0 ? candidates[displayIndex] : null;
  const hoverSrc = hoverIndex >= 0 ? candidates[hoverIndex] : null;

  const markFailed = (index: number) => {
    setFailedIndices((previous) => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  };

  if (!primarySrc) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        {placeholder ?? <ImageOff className="size-10 text-muted-foreground/40" aria-hidden="true" />}
      </div>
    );
  }

  return (
    <div className={cn('relative flex size-full items-center justify-center', className)}>
      <ProductCardImage
        src={primarySrc}
        alt={alt}
        className={cn(
          imageClassName,
          hoverSrc &&
            'transition-opacity duration-300 ease-out group-hover:opacity-0 motion-reduce:transition-none motion-reduce:group-hover:opacity-100',
        )}
        onError={() => markFailed(displayIndex)}
      />
      {hoverSrc ? (
        <ProductCardImage
          src={hoverSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            imageClassName,
            'pointer-events-none absolute inset-0 m-auto opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none',
          )}
          onError={() => markFailed(hoverIndex)}
        />
      ) : null}
    </div>
  );
}
