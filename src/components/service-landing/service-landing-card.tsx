import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import type { ServiceLandingCard } from '@/types/service-landing';
import { cn } from '@/lib/utils';

interface ServiceLandingCardProps {
  card: ServiceLandingCard;
}

export function ServiceLandingCardTile({ card }: ServiceLandingCardProps) {
  const Icon = card.icon;
  const contactHref = `/contacto?servicio=${encodeURIComponent(card.title)}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_8px_32px_-20px_hsl(var(--foreground)/0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-sky-100">
        <img
          src={card.image}
          alt=""
          className="size-full object-cover object-center"
          loading="lazy"
        />
        <span
          className="absolute bottom-0 left-5 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-600 bg-background shadow-md sm:left-6 sm:size-14"
          aria-hidden="true"
        >
          <Icon className="size-6 text-sky-600 sm:size-7" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-9 sm:px-6 sm:pb-6 sm:pt-10">
        <h2 className="text-balance text-base font-bold text-foreground sm:text-lg">{card.title}</h2>
        <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>
        <Link
          to={contactHref}
          className={cn(
            'mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-sky-600 px-4 text-sm font-semibold text-sky-700',
            'transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          Ver servicio
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        <span className="sr-only">{card.imageAlt}</span>
      </div>
    </article>
  );
}
