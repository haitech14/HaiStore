import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CatalogFilterGroupProps {
  children: ReactNode;
  className?: string;
}

/** Contenedor compacto para opciones de filtro en lista (un solo borde exterior). */
export function CatalogFilterGroup({ children, className }: CatalogFilterGroupProps) {
  return (
    <div
      className={cn(
        'divide-y divide-border/60 overflow-hidden rounded-md border border-border/70 bg-background',
        className,
      )}
    >
      {children}
    </div>
  );
}
