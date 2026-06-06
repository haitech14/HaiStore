import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, KeyRound, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  megaMenuFeatured,
  megaMenuHighlightCategories,
  megaMenuPlatforms,
  megaMenuSectionMeta,
  megaMenuServiceLinks,
  megaMenuImageForSlug,
  type MegaMenuSectionId,
} from '@/data/mega-menu';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildMegaMenuFromStoreCategories } from '@/lib/mega-menu-from-store-categories';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;
const ICON_STROKE = 1.5;

function MegaMenuLink({
  to,
  external,
  onNavigate,
  className,
  children,
}: {
  to: string;
  external?: boolean;
  onNavigate: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} onClick={onNavigate} className={className}>
      {children}
    </Link>
  );
}

function PlatformCard({
  platform,
  onNavigate,
}: {
  platform: (typeof megaMenuPlatforms)[number];
  onNavigate: () => void;
}) {
  return (
    <MegaMenuLink
      to={platform.href}
      external={platform.external ?? false}
      onNavigate={onNavigate}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2 transition-all',
        'hover:border-red-600/30 hover:bg-red-600/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
      )}
    >
      {platform.logoUrl ? (
        <img
          src={platform.logoUrl}
          alt={platform.logoAlt}
          className="h-7 w-auto max-w-[6.5rem] shrink-0 object-contain object-left"
          loading="lazy"
        />
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-600/15 text-red-600">
          {platform.icon ? (
            <platform.icon className="size-3.5" aria-hidden="true" />
          ) : (
            <KeyRound className="size-3.5" aria-hidden="true" />
          )}
        </span>
      )}
      <span className="min-w-0 flex-1">
        {!platform.logoUrl ? (
          <span className="block text-xs font-bold text-foreground">
            <span className="text-red-600">{platform.brandPrefix}</span>
            {platform.brandSuffix}
          </span>
        ) : null}
        <span className="line-clamp-1 text-[0.65rem] leading-snug text-muted-foreground">
          {platform.description}
        </span>
      </span>
      <ArrowRight
        className="size-3 shrink-0 text-red-600/70 transition-transform group-hover:translate-x-0.5 group-hover:text-red-600"
        aria-hidden="true"
      />
    </MegaMenuLink>
  );
}

export function CategoriesMegaMenu() {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const { columns, sidebarSectionIds } = useMemo(
    () => buildMegaMenuFromStoreCategories(categoryTree),
    [categoryTree],
  );

  const sidebarItems = useMemo(
    () =>
      sidebarSectionIds.map((id) => ({
        id,
        ...megaMenuSectionMeta[id],
      })),
    [sidebarSectionIds],
  );

  const defaultSection = sidebarItems[0]?.id ?? 'destacados';

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MegaMenuSectionId>(defaultSection);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateMenuWidth = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuWidth(Math.max(720, window.innerWidth - rect.left - 8));
  }, []);

  const activeColumn = useMemo(
    () => columns.find((column) => column.id === activeSection),
    [columns, activeSection],
  );

  const activeMeta = megaMenuSectionMeta[activeSection];

  useEffect(() => {
    if (!sidebarSectionIds.includes(activeSection)) {
      setActiveSection(defaultSection);
    }
  }, [activeSection, defaultSection, sidebarSectionIds]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    updateMenuWidth();
    setOpen(true);
  }, [clearCloseTimer, updateMenuWidth]);

  useEffect(() => {
    if (!open) return;
    updateMenuWidth();
    window.addEventListener('resize', updateMenuWidth);
    return () => window.removeEventListener('resize', updateMenuWidth);
  }, [open, updateMenuWidth]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const closeMenu = () => setOpen(false);

  const sectionViewAllHref =
    activeSection === 'servicios'
      ? '/servicios'
      : activeSection === 'destacados'
        ? '/tienda'
        : activeColumn?.items[0]?.href.split('?')[0]?.replace(/#.*$/, '') ?? '/tienda';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          className="h-full gap-2 rounded-none bg-red-700 text-white hover:bg-red-800 focus-visible:ring-white/50 data-[state=open]:bg-red-800"
        >
          <Menu aria-hidden="true" />
          Categorías
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 transition-transform', open && 'rotate-180')}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={0}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          'z-50 max-w-none overflow-hidden rounded-none border border-border/60 p-0 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100',
        )}
        style={menuWidth ? { width: menuWidth } : undefined}
      >
        <div className="flex min-h-0 bg-muted/15">
          <aside className="w-[10.5rem] shrink-0 border-r border-border/50 bg-background py-3 pl-2.5 pr-1.5 sm:w-[11.5rem]">
            <p className="mb-2 px-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Explorar
            </p>
            <ul className="flex flex-col gap-0.5" role="tablist" aria-label="Secciones del catálogo">
              {sidebarItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;

                return (
                  <li key={item.id} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveSection(item.id)}
                      onFocus={() => setActiveSection(item.id)}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'flex w-full min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[0.8125rem] font-semibold transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                        isActive
                          ? 'bg-red-600/10 text-red-700 shadow-sm'
                          : 'text-foreground hover:bg-muted/70',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
                          isActive
                            ? 'bg-red-600 text-white'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Icon className="size-3.5" strokeWidth={ICON_STROKE} aria-hidden="true" />
                      </span>
                      <span className="line-clamp-2 flex-1 text-pretty leading-snug">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div
            className="flex min-w-0 flex-1 flex-col bg-background"
            role="tabpanel"
            aria-label={activeMeta.label}
          >
            <div className="flex flex-1 flex-col px-3 py-3 sm:px-4 lg:px-5">
              <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                <div>
                  <h3 className="text-base font-bold text-foreground">{activeMeta.label}</h3>
                  <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">{activeMeta.description}</p>
                </div>
                <Link
                  to={sectionViewAllHref}
                  onClick={closeMenu}
                  className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  Ver todo
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              {activeSection === 'destacados' ? (
                <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-3 xl:grid-cols-4" role="list">
                  {megaMenuHighlightCategories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        to={category.href}
                        onClick={closeMenu}
                        className={cn(
                          'group flex min-h-[3.25rem] items-center gap-2 rounded-lg border border-border/60 bg-muted/10 p-2 transition-all',
                          'hover:border-red-600/25 hover:bg-red-600/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                        )}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1">
                          <img
                            src={category.image}
                            alt=""
                            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-foreground group-hover:text-red-700">
                            {category.name}
                          </span>
                          <span className="line-clamp-1 text-[0.65rem] text-muted-foreground">
                            {category.tagline}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-red-600"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : activeSection === 'servicios' ? (
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4" role="list">
                  {megaMenuServiceLinks.map((service) => {
                    const Icon = service.icon;
                    return (
                      <li key={service.slug}>
                        <Link
                          to={service.href}
                          onClick={closeMenu}
                          className={cn(
                            'group flex min-h-[3.5rem] items-center gap-2.5 rounded-lg border border-border/60 bg-muted/10 p-2 transition-all',
                            'hover:border-red-600/25 hover:bg-red-600/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                          )}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-600/10 text-red-600">
                            <Icon className="size-3.5" strokeWidth={ICON_STROKE} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-foreground group-hover:text-red-700">
                              {service.label}
                            </span>
                            <span className="line-clamp-1 text-[0.65rem] leading-snug text-muted-foreground">
                              {service.description}
                            </span>
                          </span>
                          <ChevronRight
                            className="size-3 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-red-600"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : activeColumn ? (
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3" role="list">
                  {activeColumn.items.map((item) => {
                    const Icon = item.icon;
                    const image = megaMenuImageForSlug(item.slug);

                    return (
                      <li key={`${activeColumn.id}-${item.slug}`}>
                        <Link
                          to={item.href}
                          onClick={closeMenu}
                          className={cn(
                            'group flex min-h-[2.75rem] items-center gap-2.5 rounded-lg border border-border/50 px-2 py-1.5 transition-all',
                            'hover:border-red-600/25 hover:bg-red-600/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                          )}
                        >
                          {image ? (
                            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5">
                              <img
                                src={image}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />
                            </span>
                          ) : (
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-600/10 text-red-600">
                              <Icon className="size-3.5" strokeWidth={ICON_STROKE} aria-hidden="true" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold leading-snug text-foreground group-hover:text-red-700">
                              {item.name}
                            </span>
                            {item.productCount > 0 && (
                              <span className="text-[0.65rem] text-muted-foreground">
                                {item.productCount} producto{item.productCount === 1 ? '' : 's'}
                              </span>
                            )}
                          </span>
                          <ChevronRight
                            className="size-3 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-red-600"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay categorías disponibles.</p>
              )}
            </div>

            <div className="border-t border-border/50 bg-muted/20 px-3 py-2 sm:px-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <Link
                  to="/tienda"
                  onClick={closeMenu}
                  className="font-semibold text-foreground transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  Ver tienda completa
                </Link>
                <span aria-hidden="true">·</span>
                <Link
                  to="/servicios"
                  onClick={closeMenu}
                  className="font-semibold text-foreground transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  Servicios empresariales
                </Link>
              </div>
            </div>
          </div>

          <aside
            className="hidden w-[12.5rem] shrink-0 flex-col gap-2 border-l border-border/50 bg-muted/10 p-2.5 md:flex xl:w-[13.5rem]"
            aria-label="Plataformas Haitech"
          >
            <p className="px-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Plataformas
            </p>
            <div className="flex flex-col gap-1.5">
              {megaMenuPlatforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} onNavigate={closeMenu} />
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
              <div className="relative flex items-center gap-2 p-2">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
                  <img
                    src={megaMenuFeatured.image}
                    alt=""
                    className="size-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.7rem] font-bold leading-snug text-foreground">
                    {megaMenuFeatured.title}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-1.5 h-7 w-full bg-red-600 px-2 text-[0.65rem] font-semibold text-white hover:bg-red-500"
                  >
                    <Link to={megaMenuFeatured.href} onClick={closeMenu}>
                      {megaMenuFeatured.cta}
                    </Link>
                  </Button>
                </div>
                <span className="sr-only">{megaMenuFeatured.imageAlt}</span>
              </div>
            </div>
          </aside>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
