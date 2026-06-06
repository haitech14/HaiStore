import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Hexagon,
  Mail,
  Menu,
  Search,
} from 'lucide-react';

import { ForumBackLink } from '@/components/forum/forum-layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';
import { FORUM_NAV_ITEMS } from '@/lib/forum-utils';
import { cn } from '@/lib/utils';

export function ForumHeader() {
  const { user, authProvider } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    if (q) navigate(`/foro?q=${encodeURIComponent(q)}`);
    else navigate('/foro');
  };

  const displayName = user?.name ?? 'Invitado';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg)/0.95)] backdrop-blur-md">
      <div className="container flex h-14 flex-nowrap items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:gap-4">
        <ForumBackLink className="min-h-11" />

        <Link
          to="/foro"
          className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
        >
          <span
            className="flex size-9 items-center justify-center rounded-lg bg-[hsl(var(--forum-accent)/0.15)] text-[hsl(var(--forum-accent))] sm:size-10"
            aria-hidden="true"
          >
            <Hexagon className="size-5 sm:size-6" strokeWidth={1.75} />
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="block truncate text-sm font-bold tracking-tight lg:text-base">
              Foro HaiStore
            </span>
            <span className="hidden truncate text-xs text-[hsl(var(--forum-muted))] xl:block">
              Conecta. Aprende. Innova.
            </span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="relative min-w-0 flex-1 lg:max-w-sm xl:max-w-md"
          role="search"
        >
          <label htmlFor="forum-search" className="sr-only">
            Buscar temas, usuarios, etiquetas
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--forum-muted))]"
            aria-hidden="true"
          />
          <input
            id="forum-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar temas, usuarios, etiquetas…"
            className="h-10 w-full rounded-lg border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] pl-10 pr-3 text-sm text-[hsl(var(--forum-fg))] placeholder:text-[hsl(var(--forum-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))] sm:h-11"
          />
        </form>

        <nav
          className="hidden shrink-0 items-center gap-0.5 lg:flex"
          aria-label="Secciones del foro"
        >
          {FORUM_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-10 items-center whitespace-nowrap rounded-md px-2.5 text-sm font-medium transition-colors xl:px-3',
                  isActive
                    ? 'border-b-2 border-[hsl(var(--forum-accent))] text-[hsl(var(--forum-accent))]'
                    : 'text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-fg))]',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 text-[hsl(var(--forum-fg))] hover:bg-[hsl(var(--forum-card))] lg:hidden"
                aria-label="Abrir menú del foro"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(100%,20rem)] border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg))] text-[hsl(var(--forum-fg))]"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-[hsl(var(--forum-fg))]">
                  Foro HaiStore
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Secciones del foro móvil">
                {FORUM_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'min-h-11 rounded-md px-3 py-2.5 text-sm font-medium',
                        isActive
                          ? 'bg-[hsl(var(--forum-accent)/0.15)] text-[hsl(var(--forum-accent))]'
                          : 'text-[hsl(var(--forum-muted))]',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <button
            type="button"
            className="relative inline-flex size-10 items-center justify-center rounded-md text-[hsl(var(--forum-muted))] hover:bg-[hsl(var(--forum-card))] hover:text-[hsl(var(--forum-fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))] sm:size-11"
            aria-label="Notificaciones (12 sin leer)"
          >
            <Bell className="size-5" aria-hidden="true" />
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-bold text-white">
              12
            </span>
          </button>
          <button
            type="button"
            className="relative hidden size-11 items-center justify-center rounded-md text-[hsl(var(--forum-muted))] hover:bg-[hsl(var(--forum-card))] sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
            aria-label="Mensajes (5 sin leer)"
          >
            <Mail className="size-5" aria-hidden="true" />
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[hsl(var(--forum-accent))] text-[0.6rem] font-bold text-white">
              5
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))] sm:min-h-11 sm:gap-2 sm:px-2 sm:py-1.5"
                aria-label="Menú de usuario"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[hsl(var(--forum-accent)/0.2)] text-xs font-semibold text-[hsl(var(--forum-accent))]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 md:block">
                  <span className="block max-w-[5.5rem] truncate text-sm font-semibold lg:max-w-[7rem]">
                    {displayName}
                  </span>
                  <span className="block truncate text-xs text-[hsl(var(--forum-muted))]">
                    {user ? `Nivel ${authProvider === 'supabase' ? '—' : 'demo'}` : 'Sin sesión'}
                  </span>
                </span>
                <ChevronDown className="hidden size-4 text-[hsl(var(--forum-muted))] md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/mi-cuenta">Mi cuenta</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/foro/nuevo">Nuevo tema</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login?redirect=/foro">Iniciar sesión</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
