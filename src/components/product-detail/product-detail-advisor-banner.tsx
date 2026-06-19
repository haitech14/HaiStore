import { FileCog, Headphones } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HOME_HERO_WHATSAPP_LINK } from '@/data/home-hero-slides';
import { cn } from '@/lib/utils';

interface ProductDetailAdvisorBannerProps {
  className?: string;
}

export function ProductDetailAdvisorBanner({ className }: ProductDetailAdvisorBannerProps) {
  return (
    <section
      className={cn(
        'mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/25 px-4 py-5 sm:flex-row sm:items-center sm:px-6',
        className,
      )}
      aria-label="Asesoría comercial"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
          <FileCog className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-[#0f1f3d] sm:text-base">
            ¿Necesitas ayuda para elegir la mejor configuración?
          </p>
          <p className="text-sm text-muted-foreground">
            Nuestros asesores están listos para ayudarte.
          </p>
        </div>
      </div>
      <Button
        asChild
        className="h-11 w-full shrink-0 rounded-lg bg-red-600 px-5 text-sm font-semibold hover:bg-red-500 sm:w-auto"
      >
        <a href={HOME_HERO_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
          <Headphones className="size-4 shrink-0" aria-hidden="true" />
          Hablar con un asesor
        </a>
      </Button>
    </section>
  );
}
