import { useEffect, useState } from 'react';

import { ProductImageWatermarkOverlay } from '@/components/product/product-image-watermark-overlay';
import {
  productCardImageSources,
  supportsResponsiveProductImage,
} from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

interface ProductCardImageProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

export function ProductCardImage({
  src,
  alt = '',
  className,
  loading = 'lazy',
  onError,
}: ProductCardImageProps) {
  const [forcePlainImage, setForcePlainImage] = useState(false);
  const responsive = supportsResponsiveProductImage(src) && !forcePlainImage;
  const sources = responsive ? productCardImageSources(src) : null;

  useEffect(() => {
    setForcePlainImage(false);
  }, [src]);

  const handleError = () => {
    if (responsive) {
      setForcePlainImage(true);
      return;
    }
    onError?.();
  };

  if (sources) {
    return (
      <ProductImageWatermarkOverlay src={src} className="flex size-full items-center justify-center">
        <picture className="flex size-full items-center justify-center">
          <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sources.sizes} />
          <img
            src={sources.fallbackSrc}
            alt={alt}
            className={cn(className)}
            loading={loading}
            decoding="async"
            onError={handleError}
          />
        </picture>
      </ProductImageWatermarkOverlay>
    );
  }

  return (
    <ProductImageWatermarkOverlay src={src} className="flex size-full items-center justify-center">
      <img
        src={src}
        alt={alt}
        className={cn(className)}
        loading={loading}
        decoding="async"
        onError={onError}
      />
    </ProductImageWatermarkOverlay>
  );
}
