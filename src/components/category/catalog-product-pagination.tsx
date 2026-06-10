import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CatalogProductPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CatalogProductPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: CatalogProductPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav
      aria-label="Paginación de productos"
      className={cn('flex flex-wrap items-center justify-center gap-3 pt-2', className)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 shrink-0 rounded-full"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior de productos"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>

      <p className="min-w-[8rem] text-center text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">
          {start}–{end}
        </span>{' '}
        de {totalItems}
        <span className="mx-1.5 text-border" aria-hidden="true">
          ·
        </span>
        Página {page} de {totalPages}
      </p>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 shrink-0 rounded-full"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página siguiente de productos"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
    </nav>
  );
}
