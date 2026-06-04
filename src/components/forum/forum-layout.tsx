import { Link, Outlet, ScrollRestoration } from 'react-router-dom';

import { ForumHeader } from '@/components/forum/forum-header';
import { ForumFeatureBar } from '@/components/forum/forum-feature-bar';

export function ForumLayout() {
  return (
    <div className="forum-shell flex min-h-dvh flex-col bg-[hsl(var(--forum-bg))] text-[hsl(var(--forum-fg))]">
      <ScrollRestoration />
      <a
        href="#contenido-foro"
        className="skip-link focus-visible:bg-[hsl(var(--forum-accent))] focus-visible:text-white"
      >
        Saltar al contenido
      </a>
      <ForumHeader />
      <main id="contenido-foro" className="flex-1">
        <Outlet />
      </main>
      <ForumFeatureBar />
    </div>
  );
}

export function ForumBackLink() {
  return (
    <Link
      to="/"
      className="inline-flex min-h-10 items-center text-sm font-medium text-[hsl(var(--forum-muted))] transition-colors hover:text-[hsl(var(--forum-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--forum-bg))]"
    >
      ← Volver a HaiStore
    </Link>
  );
}
