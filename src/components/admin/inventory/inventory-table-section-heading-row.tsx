import { cn } from '@/lib/utils';

interface InventoryTableSectionHeadingRowProps {
  colSpan: number;
  title: string;
  subtitle?: string;
  count: number;
  level?: 'main' | 'sub';
}

export function InventoryTableSectionHeadingRow({
  colSpan,
  title,
  subtitle,
  count,
  level = 'sub',
}: InventoryTableSectionHeadingRowProps) {
  const isMain = level === 'main';

  return (
    <tr className={cn('border-b', isMain ? 'bg-muted/50' : 'bg-muted/25')}>
      <th
        scope="colgroup"
        colSpan={colSpan}
        className={cn(
          'px-3 py-2.5 text-left font-semibold',
          isMain ? 'pt-4 text-sm text-foreground' : 'text-xs text-foreground/90',
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(isMain ? 'uppercase tracking-[0.14em]' : 'font-medium')}>
            {title}
            {subtitle ? (
              <span className="font-normal text-muted-foreground"> · {subtitle}</span>
            ) : null}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            ({count} {count === 1 ? 'producto' : 'productos'})
          </span>
          {isMain ? (
            <span className="mb-0.5 hidden h-px min-w-[2rem] flex-1 bg-red-600/60 sm:block" aria-hidden="true" />
          ) : null}
        </div>
      </th>
    </tr>
  );
}
