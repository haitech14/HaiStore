import { Link, NavLink } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { HeaderQuoteWhatsAppButton } from '@/components/layout/header-quote-whatsapp-button';
import {
  MAIN_NAV_BADGE_CLASS,
  MAIN_NAV_BAR_CLASS,
  MAIN_NAV_LINKS_ROW_CLASS,
  MAIN_NAV_ROW_CLASS,
  mainNavLinkClass,
} from '@/components/layout/main-nav-styles';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export type HeaderMainNavLink = {
  id: string;
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string }) => boolean;
  badge?: {
    label: string;
    to: string;
  };
};

export const headerMainNavLinks: HeaderMainNavLink[] = [
  {
    id: 'fotocopiadoras',
    to: categoryLandingPath('multifuncionales'),
    label: 'Fotocopiadoras',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/multifuncionales'),
  },
  {
    id: 'impresoras',
    to: categoryLandingPath('impresoras'),
    label: 'Impresoras',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/impresoras'),
  },
  {
    id: 'toner',
    to: categoryLandingPath('toner-suministros'),
    label: 'Tóner',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/toner-suministros'),
  },
  {
    id: 'repuestos',
    to: categoryLandingPath('repuestos'),
    label: 'Repuestos',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/repuestos'),
  },
  {
    id: 'servicio-tecnico',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicio Técnico',
    matchActive: ({ pathname, search }) => {
      if (pathname.startsWith('/servicio-tecnico')) return true;
      if (pathname !== '/servicios') return false;
      return new URLSearchParams(search).get('seccion') === 'servicio-tecnico';
    },
  },
  {
    id: 'marcas',
    to: '/tienda',
    label: 'Marcas',
    matchActive: ({ pathname, search }) =>
      pathname === '/tienda' && new URLSearchParams(search).has('marca'),
  },
  {
    id: 'ofertas',
    to: '/tienda',
    label: 'Ofertas',
    matchActive: ({ pathname }) => pathname === '/tienda',
    badge: {
      label: 'Nuevas',
      to: categoryPath('multifuncionales', 'multifuncionales-nuevas'),
    },
  },
];

function navLinkProps(item: HeaderMainNavLink) {
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

export function HeaderCategoryNav() {
  return (
    <nav aria-label="Menú principal" className={MAIN_NAV_BAR_CLASS}>
      <div className={MAIN_NAV_ROW_CLASS}>
        <div className={MAIN_NAV_LINKS_ROW_CLASS}>
          <CategoriesMegaMenu triggerVariant="categories-button" />

          <ul className="flex min-w-0 items-center gap-5 sm:gap-6 lg:gap-7">
            {headerMainNavLinks.map((item) => (
              <li key={item.id} className="flex shrink-0 items-center gap-2">
                <NavLink {...navLinkProps(item)} className={({ isActive }) => mainNavLinkClass(isActive)}>
                  {item.label}
                </NavLink>
                {item.badge ? (
                  <Link to={item.badge.to} className={MAIN_NAV_BADGE_CLASS}>
                    {item.badge.label}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <HeaderQuoteWhatsAppButton />
      </div>
    </nav>
  );
}

/** @deprecated Usar headerMainNavLinks */
export const mainNavItems = headerMainNavLinks;
