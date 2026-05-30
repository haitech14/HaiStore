import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { RequireAuth } from '@/components/auth/require-auth';
import { InventoryPanel } from '@/components/admin/inventory-panel';
import { SettingsPanel } from '@/components/admin/settings-panel';
import { UsersRolesPanel } from '@/components/admin/users-roles-panel';
import { cn } from '@/lib/utils';

type AdminTab = 'inventario' | 'usuarios' | 'configuracion';

function tabFromPath(pathname: string): AdminTab {
  if (pathname.includes('configuracion')) return 'configuracion';
  if (pathname.includes('usuarios')) return 'usuarios';
  return 'inventario';
}

export function AdminInventoryPage() {
  const location = useLocation();
  const [tab, setTab] = useState<AdminTab>(() => tabFromPath(location.pathname));

  useEffect(() => {
    setTab(tabFromPath(location.pathname));
  }, [location.pathname]);

  return (
    <RequireAuth adminOnly>
      <div className="container py-8">
        <nav
          aria-label="Secciones del panel"
          className="mb-8 flex flex-wrap gap-2 border-b pb-4"
        >
          <Link
            to="/panel/inventario"
            onClick={() => setTab('inventario')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'inventario'
                ? 'bg-red-600 text-white'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            Inventario
          </Link>
          <Link
            to="/panel/usuarios"
            onClick={() => setTab('usuarios')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'usuarios'
                ? 'bg-red-600 text-white'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            Roles de usuario
          </Link>
          <Link
            to="/panel/configuracion"
            onClick={() => setTab('configuracion')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'configuracion'
                ? 'bg-red-600 text-white'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            Configuración
          </Link>
        </nav>

        {tab === 'inventario' && <InventoryPanel />}
        {tab === 'usuarios' && <UsersRolesPanel />}
        {tab === 'configuracion' && <SettingsPanel />}
      </div>
    </RequireAuth>
  );
}
