import { ListFilter } from 'lucide-react';

import type { QuickFilterChip } from '@/components/category/category-quick-filters';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CategoryToolbarFiltersPopoverProps {
  tipoFilters: QuickFilterChip[];
  productionFilters: QuickFilterChip[];
  showProduction: boolean;
  selectedAttributes: string[];
  selectedProduction: string | null;
  onSelectAll: () => void;
  onToggleAttribute: (key: string) => void;
  onToggleProduction: (key: string) => void;
}

function ChipSection({
  label,
  chips,
  selectedKeys,
  onToggle,
  showTodos,
  todosActive,
  onSelectAll,
  singleSelect,
}: {
  label: string;
  chips: QuickFilterChip[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  showTodos?: boolean;
  todosActive?: boolean;
  onSelectAll?: () => void;
  singleSelect?: boolean;
}) {
  if (chips.length === 0 && !showTodos) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Filtros ${label}`}>
        {showTodos && onSelectAll ? (
          <Button
            type="button"
            size="sm"
            variant={todosActive ? 'default' : 'outline'}
            className={cn(
              'h-8 rounded-md px-3 text-xs font-semibold',
              todosActive &&
                'border-red-600 bg-red-600 text-white hover:bg-red-500 hover:text-white',
            )}
            onClick={onSelectAll}
          >
            Todos
          </Button>
        ) : null}
        {chips.map((chip) => {
          const active = selectedKeys.includes(chip.key);
          return (
            <Button
              key={chip.key}
              type="button"
              size="sm"
              variant={active ? 'secondary' : 'outline'}
              className={cn(
                'h-8 rounded-md px-3 text-xs',
                active && 'border-red-200 bg-red-50 text-red-700',
                chip.count === 0 && 'opacity-60',
              )}
              onClick={() => onToggle(chip.key)}
              disabled={chip.count === 0}
              aria-pressed={active}
            >
              {chip.label}
            </Button>
          );
        })}
      </div>
      {singleSelect ? (
        <p className="text-[0.65rem] text-muted-foreground">Selecciona un rango de producción.</p>
      ) : null}
    </div>
  );
}

export function CategoryToolbarFiltersPopover({
  tipoFilters,
  productionFilters,
  showProduction,
  selectedAttributes,
  selectedProduction,
  onSelectAll,
  onToggleAttribute,
  onToggleProduction,
}: CategoryToolbarFiltersPopoverProps) {
  const hasTipoProduccionActive =
    selectedAttributes.length > 0 || selectedProduction != null;
  const hasFilters = tipoFilters.length > 0 || (showProduction && productionFilters.length > 0);

  if (!hasFilters) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filtrar por tipo y producción"
          className={cn(
            'relative inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors sm:size-11',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            hasTipoProduccionActive && 'border-red-200 bg-red-50/50 text-foreground',
          )}
        >
          <ListFilter className="size-5" aria-hidden="true" />
          {hasTipoProduccionActive ? (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-600"
              aria-hidden="true"
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(20rem,calc(100vw-2rem))] space-y-4 p-4"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Filtros rápidos</p>
          <p className="text-xs text-muted-foreground">Tipo y producción del catálogo</p>
        </div>

        <ChipSection
          label="Tipo"
          chips={tipoFilters}
          selectedKeys={selectedAttributes}
          onToggle={onToggleAttribute}
          showTodos
          todosActive={selectedAttributes.length === 0 && !selectedProduction}
          onSelectAll={onSelectAll}
        />

        {showProduction ? (
          <ChipSection
            label="Producción"
            chips={productionFilters}
            selectedKeys={selectedProduction ? [selectedProduction] : []}
            onToggle={onToggleProduction}
            singleSelect
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
