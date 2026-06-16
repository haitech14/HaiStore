import { cn } from '@/lib/utils';

/** Barra de menú principal (referencia Ricoh / Haitech). */
export const MAIN_NAV_BAR_CLASS = 'hidden bg-[#cc1427] shadow-[0_2px_8px_rgba(0,0,0,0.18)] lg:block';

export const MAIN_NAV_ROW_CLASS = 'container flex h-8 items-stretch sm:h-9';

export function mainNavLinkClass(isActive: boolean) {
  return cn(
    'relative inline-flex h-full shrink-0 items-center whitespace-nowrap px-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-white/90 transition-colors sm:px-3.5 sm:text-xs',
    'hover:bg-black/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-inset',
    isActive &&
      'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-white sm:after:inset-x-3.5',
  );
}
