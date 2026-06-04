import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CatalogFilterOptionProps {
  id: string;
  label: string;
  count: number;
  active: boolean;
  onToggle: () => void;
  /** Una sola opción activa (estilo radio para Producción). */
  mode?: 'checkbox' | 'radio';
  disabled?: boolean;
}

export function CatalogFilterOption({
  id,
  label,
  count,
  active,
  onToggle,
  mode = 'checkbox',
  disabled = false,
}: CatalogFilterOptionProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
        active
          ? 'border-red-600 bg-red-50 text-red-700'
          : 'border-border bg-background hover:border-red-300',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-2">
        <Checkbox
          id={id}
          checked={active}
          disabled={disabled}
          onCheckedChange={(checked) => {
            if (checked === 'indeterminate') return;
            if (checked !== active) onToggle();
          }}
          aria-label={label}
          className={cn('mt-0.5 shrink-0', mode === 'radio' && 'rounded-full')}
        />
        <span className="line-clamp-3 text-pretty leading-snug">{label}</span>
      </span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{count}</span>
    </label>
  );
}
