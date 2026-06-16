import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { mainNavLinkClass, MAIN_NAV_BAR_CLASS, MAIN_NAV_ROW_CLASS } from '@/components/layout/main-nav-styles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categories } from '@/data/categories';
import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

type MainNavItem =
  | {
      kind: 'link';
      to: string;
      label: string;
      end?: boolean;
      matchActive?: (location: { pathname: string; search: string }) => boolean;
    }
  | { kind: 'productos' }
  | { kind: 'soluciones' };

const solutionCategories = categories.filter((category) =>
  category.slug.startsWith('soluciones-'),
);

const mainNavItems: MainNavItem[] = [
  { kind: 'productos' },
  { kind: 'soluciones' },
  {
    kind: 'link',
    to: '/servicios',
    label: 'Servicios',
    matchActive: ({ pathname }) => pathname === '/servicios',
  },
  {
    kind: 'link',
    to: categoryLandingPath('soluciones-negocio'),
    label: 'Industrias',
    matchActive: ({ pathname }) => pathname === categoryLandingPath('soluciones-negocio'),
  },
  {
    kind: 'link',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Soporte',
    matchActive: ({ pathname, search }) => {
      if (pathname !== '/servicios') return false;
      const seccion = new URLSearchParams(search).get('seccion');
      return seccion === 'servicio-tecnico';
    },
  },
  {
    kind: 'link',
    to: '/contacto',
    label: 'Contacto',
    end: true,
    matchActive: ({ pathname }) => pathname === '/contacto',
  },
];

function SolutionsNavItem() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          className={cn(mainNavLinkClass(open), 'gap-1')}
        >
          Soluciones
          <ChevronDown
            aria-hidden="true"
            className={cn('size-3 transition-transform', open && 'rotate-180')}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={0}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="min-w-[15rem] rounded-md border border-border/60 p-1 shadow-lg"
      >
        {solutionCategories.map((category) => (
          <Link
            key={category.slug}
            to={categoryLandingPath(category.slug)}
            onClick={() => setOpen(false)}
            className="flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {category.name}
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderCategoryNav() {
  return (
    <nav aria-label="Menú principal" className={MAIN_NAV_BAR_CLASS}>
      <div className={MAIN_NAV_ROW_CLASS}>
        <ul className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
          {mainNavItems.map((item) => {
            if (item.kind === 'productos') {
              return (
                <li key="productos" className="shrink-0">
                  <CategoriesMegaMenu triggerVariant="nav" />
                </li>
              );
            }

            if (item.kind === 'soluciones') {
              return (
                <li key="soluciones" className="shrink-0">
                  <SolutionsNavItem />
                </li>
              );
            }

            const linkProps = item.matchActive
              ? {
                  to: item.to,
                  end: item.end ?? false,
                  isActive: (_match: unknown, location: { pathname: string; search: string }) =>
                    item.matchActive!(location),
                }
              : { to: item.to, end: item.end ?? false };

            return (
              <li key={item.to} className="shrink-0">
                <NavLink
                  {...linkProps}
                  className={({ isActive }) => mainNavLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export { mainNavItems };
