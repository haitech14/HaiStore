import { Link } from 'react-router-dom';

import { businessSolutions } from '@/data/business-solutions';
import { cn } from '@/lib/utils';

export function BusinessSolutionsSection() {
  return (
    <section
      aria-labelledby="soluciones-empresa-titulo"
      className="border-b bg-background py-12 sm:py-16"
    >
      <div className="container">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <h2
            id="soluciones-empresa-titulo"
            className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Soluciones para tu empresa
          </h2>
          <span className="mx-auto mt-3 block h-0.5 w-12 bg-red-600" aria-hidden="true" />
        </header>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {businessSolutions.map((solution) => (
            <li key={solution.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
                <div className="relative">
                  <img
                    src={solution.image}
                    alt={solution.imageAlt}
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                  <span
                    className={cn(
                      'absolute bottom-0 left-1/2 flex size-14 -translate-x-1/2 translate-y-1/2',
                      'items-center justify-center rounded-full border-2 border-red-600 bg-background shadow-sm',
                    )}
                    aria-hidden="true"
                  >
                    <solution.icon className="size-6 text-red-600" strokeWidth={1.75} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-10 text-center sm:px-6">
                  <h3 className="text-lg font-bold text-foreground">{solution.title}</h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {solution.description}
                  </p>
                  <Link
                    to={solution.href}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-red-600 px-6 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                  >
                    Más información
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
