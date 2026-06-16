import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface InventoryTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

function buildPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];

  if (current > 3) items.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (current < total - 2) items.push('ellipsis');

  items.push(total);
  return items;
}

export function InventoryTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}: InventoryTablePaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageItems = buildPageItems(page, totalPages);

  return (
    <nav
      aria-label="Paginación del inventario"
      className={cn(
        'flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground">
          {start} a {end}
        </span>{' '}
        de{' '}
        <span className="font-medium text-foreground">{totalItems}</span> productos
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>

          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'size-9 tabular-nums',
                  item === page && 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-600',
                )}
                onClick={() => onPageChange(item)}
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-9 w-[8.5rem] bg-background" aria-label="Productos por página">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}

export { PAGE_SIZE_OPTIONS as INVENTORY_PAGE_SIZE_OPTIONS };
