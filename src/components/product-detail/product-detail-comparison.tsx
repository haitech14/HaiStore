import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

import { productPath } from '@/lib/product-path';
import type { ProductComparisonColumn, ProductComparisonData } from '@/lib/product-equipment-comparison';
import { cn } from '@/lib/utils';

interface ProductDetailComparisonProps {
  data: ProductComparisonData;
  className?: string;
}

function ComparisonColumnHeader({
  column,
  highlighted = false,
}: {
  column: ProductComparisonColumn;
  highlighted?: boolean;
}) {
  const labelClass = highlighted
    ? 'text-sm font-bold text-red-600 hover:text-red-500 sm:text-base'
    : 'text-sm font-bold text-[#0f1f3d] hover:text-red-600 sm:text-base';

  return (
    <div
      className={cn(
        'mx-auto flex w-full min-h-[10.5rem] max-w-[11rem] flex-col items-center justify-end gap-2 rounded-lg p-2.5 sm:min-h-[11.5rem] sm:max-w-[12rem] sm:gap-2.5 sm:p-3',
        highlighted
          ? 'border border-red-600/30 bg-red-50/90 ring-1 ring-red-600/20'
          : 'border border-transparent bg-transparent',
      )}
    >
      <div className="flex h-24 w-full flex-1 items-center justify-center sm:h-28 md:h-32">
        {column.image ? (
          <img
            src={column.image}
            alt=""
            className="max-h-full max-w-full object-contain object-bottom"
            loading="lazy"
          />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">Sin Imagen</span>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-0.5 text-center">
        {column.productId ? (
          <Link
            to={productPath(column.productId)}
            className={cn(labelClass, 'text-balance leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600')}
          >
            {column.modelLabel}
          </Link>
        ) : (
          <span className={cn(labelClass, 'text-balance leading-tight')}>{column.modelLabel}</span>
        )}
        {highlighted ? (
          <span className="text-[0.6875rem] font-medium leading-none text-red-600 sm:text-xs">
            (este equipo)
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ProductDetailComparison({ data, className }: ProductDetailComparisonProps) {
  if (data.columns.length === 0) return null;

  const otherColumns = data.columns.filter((column) => !column.isCurrent);
  const currentColumn = data.columns.find((column) => column.isCurrent) ?? data.columns[0];

  return (
    <section
      className={cn('mt-10 border-t border-border/60 pt-8 sm:mt-12', className)}
      aria-labelledby="comparacion-titulo"
    >
      <div className="mb-5 sm:mb-6">
        <h2 id="comparacion-titulo" className="text-lg font-bold text-[#0f1f3d] sm:text-xl">
          {data.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-sm sm:min-w-[56rem]">
          <thead>
            <tr>
              <th scope="col" className="w-[30%] border-b border-border/60 pb-4 align-bottom" />
              {otherColumns.map((column) => (
                <th
                  key={column.modelLabel}
                  scope="col"
                  className="w-[17.5%] border-b border-border/60 px-2 pb-4 align-bottom sm:px-3"
                >
                  <ComparisonColumnHeader column={column} />
                </th>
              ))}
              <th
                scope="col"
                className="w-[17.5%] border-b border-border/60 px-2 pb-4 align-bottom sm:px-3"
              >
                <ComparisonColumnHeader column={currentColumn} highlighted />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={row.id} className={cn(rowIndex % 2 === 0 ? 'bg-muted/15' : 'bg-white')}>
                <th
                  scope="row"
                  className="border-b border-border/50 px-3 py-3 text-left font-medium text-[#0f1f3d]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ChevronRight
                      className="size-3.5 shrink-0 text-muted-foreground/70"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    {row.label}
                  </span>
                </th>
                {otherColumns.map((column) => {
                  const value = column.values[row.id];
                  return (
                    <td
                      key={`${column.modelLabel}-${row.id}`}
                      className="border-b border-border/50 px-3 py-3 text-center text-[#0f1f3d]"
                    >
                      {value === true ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                          <span className="sr-only">Sí</span>
                        </span>
                      ) : (
                        <span>{typeof value === 'string' ? value : '—'}</span>
                      )}
                    </td>
                  );
                })}
                <td
                  className={cn(
                    'border-b border-red-600/15 bg-red-50/90 px-3 py-3 text-center font-medium text-[#0f1f3d]',
                    rowIndex === 0 && 'border-t border-red-600/20',
                  )}
                >
                  {(() => {
                    const value = currentColumn.values[row.id];
                    if (value === true) {
                      return (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                          <span className="sr-only">Sí</span>
                        </span>
                      );
                    }
                    return (
                      <span className={cn(row.id === 'volume' && 'font-bold')}>
                        {typeof value === 'string' ? value : '—'}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-right">
        <Link
          to="/tienda?buscar=ricoh+im"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] underline-offset-2 hover:text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ver comparación completa
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </p>
    </section>
  );
}
