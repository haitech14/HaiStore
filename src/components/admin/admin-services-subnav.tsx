import { NavLink, useLocation } from 'react-router-dom';

import { ADMIN_ROUTES, ADMIN_SERVICES_NAV } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

function isServicesTabActive(tab: string | null, search: string): boolean {
  const current = new URLSearchParams(search).get('tab');
  if (!tab) {
    return !current || current === 'servicios';
  }
  return current === tab;
}

export function AdminServicesSubNav() {
  const { search } = useLocation();

  return (
    <nav
      aria-label="Secciones de servicios, categorías y lista de precios"
      className="border-b bg-background px-4 sm:px-6"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_SERVICES_NAV.map((item) => (
          <li key={item.label} className="shrink-0">
            <NavLink
              to={
                item.tab
                  ? { pathname: ADMIN_ROUTES.SERVICES, search: `?tab=${item.tab}` }
                  : ADMIN_ROUTES.SERVICES
              }
              className={() => {
                const active = isServicesTabActive(item.tab, search);
                return cn(
                  'inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
                  active
                    ? 'bg-[hsl(var(--admin-accent))]/10 text-[hsl(var(--admin-accent))]'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                );
              }}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
