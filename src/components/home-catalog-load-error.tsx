import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HomeCatalogLoadErrorProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function HomeCatalogLoadError({
  message = 'No se pudieron cargar los productos. Inténtalo de nuevo.',
  onRetry,
  isRetrying = false,
  className,
}: HomeCatalogLoadErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-destructive">{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isRetrying}
        onClick={onRetry}
        className="shrink-0 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <RefreshCw className={cn('size-4', isRetrying && 'animate-spin')} aria-hidden="true" />
        {isRetrying ? 'Reintentando…' : 'Reintentar'}
      </Button>
    </div>
  );
}
