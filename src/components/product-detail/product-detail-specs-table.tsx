import type { ProductSpecRow } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductDetailSpecsTableProps {
  specs: ProductSpecRow[];
  className?: string;
}

export function ProductDetailSpecsTable({ specs, className }: ProductDetailSpecsTableProps) {
  if (specs.length === 0) return null;

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/60', className)}>
      <table className="w-full text-left text-sm">
        <tbody>
          {specs.map((row, index) => (
            <tr
              key={row.label}
              className={cn(index % 2 === 0 ? 'bg-muted/30' : 'bg-white')}
            >
              <th
                scope="row"
                className="w-[42%] px-4 py-2.5 font-semibold text-[#0f1f3d] sm:py-3"
              >
                {row.label}
              </th>
              <td className="px-4 py-2.5 text-muted-foreground sm:py-3">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
