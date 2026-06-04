import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickFilterChip {
  key: string;
  label: string;
  count: number;
}

interface CategoryQuickFiltersProps {
  modelFilters: QuickFilterChip[];
  selectedAttributes: string[];
  onToggleAttribute: (key: string) => void;
}

/** Fila de modelos de equipo (Tipo y Producción van en el popover de la barra). */
export function CategoryQuickFilters({
  modelFilters,
  selectedAttributes,
  onToggleAttribute,
}: CategoryQuickFiltersProps) {
  if (modelFilters.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-border bg-card/80 p-3 shadow-sm sm:p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Modelos
      </p>
      <div
        className="-mx-1 grid auto-cols-max grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-1 pb-1 scroll-smooth"
        role="group"
        aria-label="Filtros por modelo de equipo"
      >
        {modelFilters.map((chip) => {
          const active = selectedAttributes.includes(chip.key);
          return (
            <Button
              key={chip.key}
              type="button"
              size="sm"
              variant={active ? 'secondary' : 'outline'}
              className={cn(
                'h-8 shrink-0 whitespace-nowrap rounded-md px-3 text-xs',
                active && 'border-red-200 bg-red-50 text-red-700',
                chip.count === 0 && 'opacity-60',
              )}
              onClick={() => onToggleAttribute(chip.key)}
              disabled={chip.count === 0}
              title={chip.label}
            >
              {chip.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
