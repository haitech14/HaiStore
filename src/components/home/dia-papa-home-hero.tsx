import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { HOME_HERO_WHATSAPP_LINK, HOME_HERO_WHATSAPP_NUMBER } from '@/data/home-hero-slides';
import { cn } from '@/lib/utils';

const GIFT_IMAGE = '/hero/dia-papa-2026-gift.png';
const FAMILY_IMAGE = '/hero/dia-papa-2026-family.png';

interface DiaPapaHomeHeroProps {
  headingId?: string;
  shopHref?: string;
  imageAlt: string;
  className?: string;
}

export function DiaPapaHomeHero({
  headingId = 'hero-titulo',
  shopHref = '/tienda',
  imageAlt,
  className,
}: DiaPapaHomeHeroProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-gradient-to-br from-background via-white to-red-50/40',
        className,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 z-10 h-1 bg-red-600"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-16 top-8 size-56 rounded-full bg-red-600/5 blur-3xl sm:size-72"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-0 size-48 rounded-full bg-red-600/5 blur-2xl sm:size-64"
        aria-hidden="true"
      />

      <div className="container relative grid min-h-[min(52vw,22rem)] grid-cols-1 items-center gap-4 py-6 sm:min-h-[min(44vw,24rem)] sm:gap-6 sm:py-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:min-h-[min(38vw,26rem)] lg:gap-8 lg:py-10">
        <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-red-600/20 bg-white/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-red-600 backdrop-blur-sm sm:text-xs">
            <Gift className="size-3.5" aria-hidden="true" />
            Día del Padre
          </span>

          <h1
            id={headingId}
            className="max-w-xl text-balance font-heading text-3xl uppercase leading-[0.92] tracking-wide text-foreground sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
          >
            <span className="block text-red-600">Para papá,</span>
            <span className="block">tecnología que inspira</span>
          </h1>

          <p className="mt-3 max-w-lg text-pretty text-sm text-muted-foreground sm:mt-4 sm:text-base">
            Sorpréndelo con equipos y suministros de impresión con envío, garantía y soporte experto
            en todo el Perú.
          </p>

          <div className="mt-4 flex w-full flex-col gap-2.5 sm:mt-5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to={shopHref}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-red-600 px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(220,38,38,0.28)] transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:min-h-12 sm:px-6"
            >
              Explorar la tienda
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={HOME_HERO_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border bg-white px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:min-h-12 sm:px-6"
            >
              <Icon path={mdiWhatsapp} size={0.9} className="text-[#25D366]" aria-hidden="true" />
              Cotizar · {HOME_HERO_WHATSAPP_NUMBER}
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-xl items-end justify-center md:max-w-none md:justify-end">
          <img
            src={GIFT_IMAGE}
            alt=""
            width={960}
            height={400}
            className="relative z-[1] w-full max-w-md object-contain object-bottom sm:max-w-lg lg:max-w-none"
            loading="eager"
            decoding="async"
            aria-hidden="true"
          />
          <img
            src={FAMILY_IMAGE}
            alt=""
            width={280}
            height={280}
            className="absolute bottom-2 left-2 z-[2] w-[5.5rem] drop-shadow-md sm:bottom-4 sm:left-4 sm:w-[7rem] md:left-auto md:right-[42%] lg:w-[8.5rem]"
            loading="eager"
            decoding="async"
            aria-hidden="true"
          />
        </div>
      </div>

      <span className="sr-only">{imageAlt}</span>
    </div>
  );
}
