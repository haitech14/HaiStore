import { MapPin } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import {
  HAITECH_WHATSAPP_DISPLAY,
  HAITECH_WHATSAPP_URL,
} from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const HEADER_TOP_BAR_ADDRESS = 'Lima: Av. Petit Thouars 1964 - Lince';

const linkClass =
  'inline-flex min-h-6 shrink-0 items-center gap-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function HeaderTopBar() {
  return (
    <div className="border-b border-border/40 bg-transparent text-muted-foreground">
      <div className="container flex items-center justify-between gap-2 py-0.5 text-[10px] sm:gap-3">
        <a
          href={HAITECH_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={`Contactar por WhatsApp al ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <Icon path={mdiWhatsapp} size={0.65} className="shrink-0" aria-hidden="true" />
          <span className="font-medium tabular-nums">915 149 290</span>
        </a>

        <p
          className={cn(
            'flex min-w-0 items-center gap-1',
            'justify-end sm:justify-start',
          )}
        >
          <MapPin className="size-2.5 shrink-0" aria-hidden="true" />
          <span className="truncate sm:whitespace-nowrap">{HEADER_TOP_BAR_ADDRESS}</span>
        </p>
      </div>
    </div>
  );
}
