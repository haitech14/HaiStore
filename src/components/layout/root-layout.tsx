import { Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/header';
import { SiteFooter } from '@/components/layout/site-footer';
import { SubscriptionPopup } from '@/components/SubscriptionPopup';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <SubscriptionPopup />
    </div>
  );
}
