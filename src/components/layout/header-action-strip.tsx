import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingCart, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { HeaderCartExchangeBar } from '@/components/layout/header-currency-control';
import { cn } from '@/lib/utils';

const stripItemClass =
  'flex min-h-9 items-center gap-1.5 px-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const stripIconWrapClass =
  'flex size-6 shrink-0 items-center justify-center text-foreground';

interface HeaderActionStripProps {
  cartCount: number;
  cartAriaLabel: string;
  onOpenCart: () => void;
  className?: string;
}

export function HeaderActionStrip({
  cartCount,
  cartAriaLabel,
  onOpenCart,
  className,
}: HeaderActionStripProps) {
  return (
    <div className={cn('hidden shrink-0 items-center sm:flex', className)}>
      <div className="flex items-center bg-white">
        <Link
          to="/servicios?seccion=servicio-tecnico"
          className={stripItemClass}
          aria-label="Soporte técnico"
        >
          <span className={stripIconWrapClass}>
            <Wrench className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>Soporte</span>
        </Link>

        <Link to="/contacto" className={stripItemClass} aria-label="Contacto">
          <span className={stripIconWrapClass}>
            <MessageSquare className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>Contacto</span>
        </Link>

        <AccountDropdown triggerVariant="strip" />

        <HeaderCartExchangeBar />

        <button
          type="button"
          className={stripItemClass}
          aria-label={cartAriaLabel}
          onClick={onOpenCart}
        >
          <span className={cn(stripIconWrapClass, 'relative')}>
            <ShoppingCart className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            {cartCount > 0 && (
              <Badge
                className="absolute -right-1.5 -top-1.5 h-3.5 min-w-3.5 justify-center bg-red-600 px-0.5 text-[0.55rem]"
                aria-hidden="true"
              >
                {cartCount}
              </Badge>
            )}
          </span>
          <span>Carrito</span>
        </button>
      </div>
    </div>
  );
}
