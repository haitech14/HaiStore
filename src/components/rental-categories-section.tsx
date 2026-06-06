import { Link } from 'react-router-dom';

import { RentalCategoriesCarousel } from '@/components/rental-categories-carousel';
import { enterpriseServiceCarouselItems } from '@/data/enterprise-services-carousel';

export function RentalCategoriesSection() {
  return (
    <section aria-labelledby="servicios-empresariales-titulo" className="bg-muted/30">
      <div className="container py-10 sm:py-14">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
            <h2
              id="servicios-empresariales-titulo"
              className="text-balance text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl"
            >
              <span className="text-red-600">Servicios</span>{' '}
              <span className="text-foreground">Empresariales</span>
            </h2>
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
          </div>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Alquiler, soporte técnico, outsourcing y soluciones corporativas para tu operación.
            Elige un servicio y solicita cotización con nuestro equipo.
          </p>
          <Link
            to="/servicios"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Ver todos los servicios
          </Link>
        </header>

        <RentalCategoriesCarousel
          items={enterpriseServiceCarouselItems}
          ariaLabel="Servicios empresariales"
        />
      </div>
    </section>
  );
}
