import { useRef } from 'react';
import { ImageIcon, Loader2, Plus } from 'lucide-react';

import { getProductMediaUrls } from '@/lib/inventory-product';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        'size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted',
        className,
      )}
    >
      <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />
    </div>
  );
}

const slotButtonClass =
  'flex size-11 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

interface InventoryMediaCellProps {
  product: InventoryProduct;
  onPreview?: () => void;
  /** Sube la foto principal (primer archivo). */
  onUploadMain?: (files: FileList) => void | Promise<void>;
  /** Añade imágenes a la galería. */
  onAddGallery?: (files: FileList) => void | Promise<void>;
  isAddingGallery?: boolean;
}

/** Foto principal, botón de imagen para subir y botón + para galería. */
export function InventoryMediaCell({
  product,
  onPreview,
  onUploadMain,
  onAddGallery,
  isAddingGallery = false,
}: InventoryMediaCellProps) {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const urls = getProductMediaUrls(product);
  const main = urls[0] ?? null;
  const canUploadMain = Boolean(onUploadMain) && !isAddingGallery;
  const canAddGallery = Boolean(onAddGallery) && !isAddingGallery;

  const thumbButtonClass =
    'rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  const openMainPicker = () => {
    if (canUploadMain) mainInputRef.current?.click();
  };

  const openGalleryPicker = () => {
    if (canAddGallery) galleryInputRef.current?.click();
  };

  const mainInput = onUploadMain ? (
    <input
      ref={mainInputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const files = event.target.files;
        if (files?.length) void onUploadMain(files);
        event.target.value = '';
      }}
    />
  ) : null;

  const galleryInput = onAddGallery ? (
    <input
      ref={galleryInputRef}
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const files = event.target.files;
        if (files?.length) void onAddGallery(files);
        event.target.value = '';
      }}
    />
  ) : null;

  const mainSlot = main ? (
    <button
      type="button"
      className={thumbButtonClass}
      onClick={onPreview}
      aria-label={`Ampliar foto principal de ${product.name}`}
    >
      <Thumb src={main} alt={`Foto de ${product.name}`} />
    </button>
  ) : (
    <button
      type="button"
      className={slotButtonClass}
      onClick={openMainPicker}
      disabled={!canUploadMain}
      aria-label={`Subir foto principal de ${product.name}`}
    >
      {isAddingGallery ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <ImageIcon className="size-4" aria-hidden="true" />
      )}
    </button>
  );

  const addButton = (
    <button
      type="button"
      className={slotButtonClass}
      onClick={openGalleryPicker}
      disabled={!canAddGallery}
      aria-label={`Agregar fotos a la galería de ${product.name}`}
    >
      {isAddingGallery ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Plus className="size-4" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {mainInput}
      {galleryInput}
      {mainSlot}
      {addButton}
    </div>
  );
}
