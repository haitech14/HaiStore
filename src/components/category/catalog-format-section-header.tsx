import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

function formatProductCount(count: number): string {
  return `(${count} ${count === 1 ? 'producto' : 'productos'})`;
}

interface CatalogFormatMainHeaderProps {
  title: string;
  count: number;
  className?: string;
}

export function CatalogFormatMainHeader({ title, count, className }: CatalogFormatMainHeaderProps) {
  return (
    <div className={cn('pb-2 sm:pb-2.5', className)}>
      <div className="flex flex-wrap items-end gap-2">
        <h2 className="text-balance text-lg font-bold tracking-tight text-[#0f1f3d] sm:text-xl">
          {title}
        </h2>
        <span className="pb-0.5 text-xs text-muted-foreground sm:text-sm">
          {formatProductCount(count)}
        </span>
      </div>
    </div>
  );
}

interface CatalogFormatSubHeaderProps {
  title: string;
  count: number;
  viewAllHref: string;
  viewAllLabel?: string;
  className?: string;
}

export function CatalogFormatSubHeader({
  title,
  count,
  viewAllHref,
  viewAllLabel = 'Ver todos',
  className,
}: CatalogFormatSubHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 pb-2', className)}>
      <div className="flex min-w-0 flex-wrap items-end gap-2">
        <h3 className="text-balance text-sm font-bold text-[#0f1f3d] sm:text-base">{title}</h3>
        <span className="pb-0.5 text-xs text-muted-foreground sm:text-sm">
          {formatProductCount(count)}
        </span>
      </div>
      <Link
        to={viewAllHref}
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:text-sm"
      >
        {viewAllLabel}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
