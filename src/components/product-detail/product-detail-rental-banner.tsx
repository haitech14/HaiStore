import { Link } from 'react-router-dom';
import { CalendarDays, Check } from 'lucide-react';

import { buildProductImageCandidates } from '@/lib/product-image-url';
import { cn } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';
import type { Product } from '@/types/product';

const RENTAL_BENEFITS = [
  'Sin inversión inicial',
  'Mantenimiento incluido',
  'Soporte técnico',
  'Planes flexibles para tu negocio',
] as const;

interface ProductDetailRentalBannerProps {
  product: Product;
  plans: RentalPlanOption[];
  className?: string;
}

export function ProductDetailRentalBanner({
  product,
  plans,
  className,
}: ProductDetailRentalBannerProps) {
  if (plans.length === 0) return null;

  const startingPricePen = Math.min(...plans.map((plan) => plan.monthlyPricePen));
  const productImage =
    buildProductImageCandidates(product)[0] ?? '/services/alquiler/impresoras.png';
  const contactHref = `/contacto?servicio=${encodeURIComponent(product.name)}`;

  return (
    <section
      aria-labelledby="rental-banner-title"
      className={cn(
        'overflow-hidden rounded-xl border border-emerald-200/80 bg-emerald-50/90',
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border-2 border-red-600/30 bg-white text-red-600 sm:size-12"
            aria-hidden="true"
          >
            <CalendarDays className="size-5 sm:size-6" strokeWidth={2} />
          </span>
          <div className="min-w-0 space-y-1">
            <h2
              id="rental-banner-title"
              className="text-base font-bold text-[#0f1f3d] sm:text-lg"
            >
              ¿Prefieres alquilarla?
            </h2>
            <p className="text-sm text-[#0f1f3d] sm:text-base">
              Desde{' '}
              <span className="text-2xl font-bold text-emerald-600 sm:text-3xl">
                S/ {startingPricePen.toLocaleString('es-PE')}
              </span>{' '}
              <span className="text-muted-foreground">al mes</span>
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Incluye mantenimiento, soporte y plan de páginas.
            </p>
          </div>
        </div>

        <Link
          to={contactHref}
          className={cn(
            'inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border-2 border-emerald-600 bg-white px-5 text-sm font-bold text-emerald-700',
            'transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
            'lg:self-center',
          )}
        >
          Solicitar alquiler
        </Link>

        <ul className="grid min-w-0 flex-1 gap-2 sm:gap-2.5 lg:max-w-xs">
          {RENTAL_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-[#0f1f3d]">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[0.65rem] font-bold text-white"
                aria-hidden="true"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center justify-center lg:w-36 xl:w-40">
          <img
            src={productImage}
            alt=""
            className="max-h-28 w-full max-w-[9rem] object-contain object-center sm:max-h-32 lg:max-h-36"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
