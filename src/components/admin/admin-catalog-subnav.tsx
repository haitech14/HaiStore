import { FolderTree, ListOrdered, Package } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { ADMIN_CATALOG_NAV, ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

const TAB_ICONS = {
  [ADMIN_ROUTES.INVENTORY]: Package,
  [ADMIN_ROUTES.CATEGORIES]: FolderTree,
  [ADMIN_ROUTES.PRICE_LISTS]: ListOrdered,
} as const;

export function AdminCatalogSubNav() {
  return (
    <nav
      aria-label="Secciones de inventario, categorías y precios"
      className="border-b bg-background px-4 sm:px-6"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_CATALOG_NAV.map((item) => {
          const Icon = TAB_ICONS[item.href];
          return (
            <li key={item.href} className="shrink-0">
              <NavLink
                to={item.href}
                end
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
