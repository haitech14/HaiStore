import { Link } from 'react-router-dom';

import { RentalCategoriesCarousel } from '@/components/rental-categories-carousel';

export function RentalCategoriesSection() {
  return (
    <section aria-labelledby="alquiler-titulo" className="bg-muted/30">
      <div className="container py-10 sm:py-14">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
            <h2
              id="alquiler-titulo"
              className="text-balance text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl"
            >
              <span className="text-red-600">Alquiler</span>{' '}
              <span className="text-foreground">de equipos</span>
            </h2>
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
          </div>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Soluciones flexibles para proyectos, eventos y operación temporal. Elige el tipo de
            equipo y cotiza con nuestro equipo.
          </p>
          <Link
            to="/servicios"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-primary/30 bg-background px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver todos los servicios de alquiler
          </Link>
        </header>

        <RentalCategoriesCarousel />
      </div>
    </section>
  );
}
