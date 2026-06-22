import { FileDown, FileText, Scale } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailHeroActionsProps {
  technicalSheetUrl: string | null;
  onCompareClick?: () => void;
  onQuoteClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

const actionClassName =
  'inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-[#0f1f3d] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

export function ProductDetailHeroActions({
  technicalSheetUrl,
  onCompareClick,
  onQuoteClick,
  className,
  fullWidth = false,
}: ProductDetailHeroActionsProps) {
  const itemClassName = cn(actionClassName, fullWidth && 'w-full');
  const columnCount = 2 + (onQuoteClick ? 1 : 0);

  return (
    <div
      className={cn(
        fullWidth
          ? cn('grid w-full gap-2.5', columnCount === 3 ? 'grid-cols-3' : 'grid-cols-2')
          : 'flex shrink-0 flex-wrap items-stretch justify-end gap-2',
        className,
      )}
    >
      {technicalSheetUrl ? (
        <a
          href={technicalSheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClassName}
        >
          <FileDown className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Ficha técnica
        </a>
      ) : (
        <button
          type="button"
          disabled
          className={cn(itemClassName, 'cursor-not-allowed opacity-50 hover:bg-background')}
          title="Ficha técnica no disponible"
        >
          <FileDown className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Ficha técnica
        </button>
      )}

      {onCompareClick ? (
        <button type="button" onClick={onCompareClick} className={itemClassName}>
          <Scale className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Comparar
        </button>
      ) : (
        <button
          type="button"
          disabled
          className={cn(itemClassName, 'cursor-not-allowed opacity-50 hover:bg-background')}
          title="Comparación no disponible para este producto"
        >
          <Scale className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Comparar
        </button>
      )}

      {onQuoteClick ? (
        <button type="button" onClick={onQuoteClick} className={itemClassName}>
          <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Cotizar
        </button>
      ) : null}
    </div>
  );
}
