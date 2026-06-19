import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface CategoryActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  className?: string;
}

export function CategoryActiveFilterChips({ chips, className }: CategoryActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="list"
      aria-label="Filtros activos"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          role="listitem"
          onClick={chip.onRemove}
          className={cn(
            'inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-md border border-red-600/25 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition-colors sm:text-sm',
            'hover:border-red-600/40 hover:bg-red-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          )}
          aria-label={`Quitar filtro ${chip.label}`}
        >
          <span className="truncate">{chip.label}</span>
          <X className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
