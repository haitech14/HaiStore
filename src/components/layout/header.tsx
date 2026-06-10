import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import {
  HeaderCurrencyControl,
  HeaderExchangeRateStrip,
} from '@/components/layout/header-currency-control';
import { SiteSearchForm } from '@/components/layout/site-search-form';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useWishlist } from '@/context/wishlist-context';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

type MainNavItem = {
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string }) => boolean;
};

const homeItem: MainNavItem = { to: '/', label: 'Inicio', end: true };

const navItems: MainNavItem[] = [
  { to: '/tienda', label: 'Tienda' },
  {
    to: '/servicios',
    label: 'Alquiler',
    matchActive: ({ pathname, search }) => {
      if (pathname !== '/servicios') return false;
      const seccion = new URLSearchParams(search).get('seccion');
      return !seccion || seccion === 'alquiler';
    },
  },
  {
    to: '/servicios?seccion=servicio-tecnico',
    label: 'Servicio técnico',
    matchActive: ({ pathname, search }) =>
      pathname === '/servicios' &&
      new URLSearchParams(search).get('seccion') === 'servicio-tecnico',
  },
  { to: '/contacto', label: 'Contacto' },
];

const utilityLinksLeft = [
  {
    label: 'Ventas 915 149 290',
    href: 'https://wa.me/51915149290',
    external: true,
    icon: 'whatsapp' as const,
  },
  {
    label: 'Soporte 965 805 873',
    href: 'https://wa.me/51965805873',
    external: true,
    icon: 'phone' as const,
  },
  {
    label: 'ventas@haitech.pe',
    href: 'mailto:ventas@haitech.pe',
    external: false,
    icon: 'mail' as const,
  },
  {
    label: 'Ubicación',
    href: '/contacto',
    external: false,
    icon: 'location' as const,
  },
] as const;

type UtilityIconType = (typeof utilityLinksLeft)[number]['icon'];

function UtilityIcon({ type }: { type: UtilityIconType }) {
  const className = 'size-4 shrink-0 text-current';

  switch (type) {
    case 'whatsapp':
      return <Icon path={mdiWhatsapp} size={0.67} className={className} aria-hidden="true" />;
    case 'phone':
      return <Phone className={className} aria-hidden="true" />;
    case 'mail':
      return <Mail className={className} aria-hidden="true" />;
    case 'location':
      return <MapPin className={className} aria-hidden="true" />;
  }
}

const utilityLinkClass =
  'flex shrink-0 items-center gap-1.5 whitespace-nowrap text-neutral-400 transition-colors hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50';

function UtilityBarLink({
  label,
  href,
  icon,
  external,
}: {
  label: string;
  href: string;
  icon: UtilityIconType;
  external?: boolean;
}) {
  if (external || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={utilityLinkClass}
      >
        <UtilityIcon type={icon} />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <Link to={href} className={utilityLinkClass}>
      <UtilityIcon type={icon} />
      <span>{label}</span>
    </Link>
  );
}

function desktopLinkClass(isActive: boolean) {
  return cn(
    'relative inline-flex h-10 items-center px-3 text-sm font-medium transition-colors hover:bg-red-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
    isActive
      ? 'font-semibold text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-white'
      : 'text-white/90',
  );
}

function mainNavLinkProps(item: MainNavItem) {
  if (!item.matchActive) {
    return { to: item.to, end: item.end ?? false };
  }

  return {
    to: item.to,
    end: item.end ?? false,
    isActive: (_match: unknown, location: { pathname: string; search: string }) =>
      item.matchActive!(location),
  };
}

function favoritesSubtitle(count: number): string {
  if (count === 0) return 'Vacío';
  return count === 1 ? '1 guardado' : `${count} guardados`;
}

export function Header() {
  const { totalItems, totalPrice, openCart } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const { totalItems: favoritesCount } = useWishlist();
  const cartTotalLabel =
    displayCurrency === 'PEN' ? formatPenFromUsd(totalPrice) : formatUsd(totalPrice);
  const cartTotalAria =
    displayCurrency === 'PEN'
      ? `${formatPenFromUsd(totalPrice)}, tipo de cambio venta`
      : `${totalPrice.toFixed(2)} dólares`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 4);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm',
        scrolled && 'shadow-md ring-1 ring-border/50',
      )}
    >
      {/* Barra superior de utilidades */}
      <div className="bg-black text-neutral-400">
        <div className="container flex h-9 items-center gap-4 overflow-x-auto text-xs sm:gap-6 sm:overflow-visible">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            {utilityLinksLeft.map((item) => (
              <UtilityBarLink
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                external={item.external}
              />
            ))}
          </div>
          <HeaderExchangeRateStrip />
        </div>
      </div>

      {/* Fila principal */}
      <div className="container flex h-16 items-center gap-3 sm:gap-4">
        {/* Botón menú móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>

        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 sm:gap-2.5"
          aria-label="Haitech, inicio"
        >
          <img src="/logo.png" alt="Haitech Soluciones Tecnológicas" className="h-10 w-auto" />
          <img
            src="/ricohpartner.png"
            alt="Ricoh Alliance Partner"
            className="h-14 w-auto rounded-sm sm:h-16"
            loading="lazy"
          />
        </Link>

        {/* Buscador */}
        <div className="hidden flex-1 justify-center md:flex">
          <SiteSearchForm className="max-w-xl" />
        </div>

        <HeaderCurrencyControl className="hidden shrink-0 md:flex" />

        <AccountDropdown />

        <div className="ml-auto flex items-center gap-0.5 sm:ml-0 sm:gap-1">
          {/* Favoritos */}
          <Button
            variant="ghost"
            className="h-11 gap-2 px-2"
            asChild
          >
            <Link
              to="/favoritos"
              aria-label={`Favoritos, ${favoritesCount} productos guardados`}
            >
              <span className="relative">
                <Heart className="size-6 text-red-600" strokeWidth={2} aria-hidden="true" />
                {favoritesCount > 0 && (
                  <Badge
                    className="absolute -right-2 -top-2 h-5 min-w-5 justify-center bg-red-600 px-1"
                    aria-hidden="true"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </span>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-semibold">Favoritos</span>
                <span className="text-xs text-muted-foreground">
                  {favoritesSubtitle(favoritesCount)}
                </span>
              </span>
            </Link>
          </Button>

          {/* Carrito — siempre accesible en cabecera sticky */}
        <Button
          type="button"
          variant="ghost"
          className="relative h-11 gap-2 px-2"
          aria-label={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
          onClick={openCart}
        >
          <span className="relative">
            <ShoppingCart className="size-6 text-red-600" aria-hidden="true" />
            {totalItems > 0 && (
              <Badge
                className="absolute -right-2 -top-2 h-5 min-w-5 justify-center bg-red-600 px-1 motion-safe:animate-in motion-safe:zoom-in"
                aria-hidden="true"
              >
                {totalItems}
              </Badge>
            )}
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-semibold">Carrito</span>
            <span className="text-xs text-muted-foreground">{cartTotalLabel}</span>
          </span>
        </Button>
        </div>
      </div>

      {/* Navegación secundaria (desktop) */}
      <nav
        aria-label="Navegación principal"
        className="hidden border-0 bg-red-600 lg:block"
      >
        <div className="container flex h-10 items-stretch">
          <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            <li className="shrink-0">
              <NavLink
                {...mainNavLinkProps(homeItem)}
                className={({ isActive }) => desktopLinkClass(isActive)}
              >
                {homeItem.label}
              </NavLink>
            </li>
            {navItems.map((item) => (
              <li key={item.label} className="shrink-0">
                <NavLink
                  {...mainNavLinkProps(item)}
                  className={({ isActive }) => desktopLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Panel móvil */}
      {mobileOpen && (
        <div className="border-t lg:hidden">
          <div className="container flex flex-col gap-4 py-4">
            <HeaderCurrencyControl className="w-full md:hidden" />
            <SiteSearchForm onNavigate={() => setMobileOpen(false)} />
            <nav aria-label="Navegación móvil">
              <ul className="flex flex-col">
                {[homeItem, ...navItems].map((item) => (
                  <li key={item.label}>
                    <NavLink
                      {...mainNavLinkProps(item)}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                          isActive ? 'text-red-600' : 'text-foreground',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

    </header>
  );
}
