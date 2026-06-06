import { Link, Outlet, ScrollRestoration } from 'react-router-dom';

import { ForumHeader } from '@/components/forum/forum-header';
import { cn } from '@/lib/utils';
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

export function ForumBackLink({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap text-xs font-medium text-[hsl(var(--forum-muted))] transition-colors hover:text-[hsl(var(--forum-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))] sm:text-sm',
        className,
      )}
      aria-label="Volver a HaiStore"
    >
      <span className="sm:hidden" aria-hidden="true">
        ←
      </span>
      <span className="hidden sm:inline">← Volver a HaiStore</span>
    </Link>
  );
}
