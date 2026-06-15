import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronDown, Headphones } from 'lucide-react';

import { HOME_FAQ_ITEMS, type HomeFaqItem } from '@/data/home-faq';
import { cn } from '@/lib/utils';

function FaqItem({
  item,
  expanded,
  onToggle,
}: {
  item: HomeFaqItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const triggerId = useId();
  const panelId = useId();
  const Icon = item.icon;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(15,31,61,0.06)]',
        expanded && 'border-red-600/20 shadow-[0_4px_20px_rgba(220,38,38,0.08)]',
      )}
    >
      <button
        type="button"
        id={triggerId}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:px-4 sm:py-4"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600"
          aria-hidden="true"
        >
          <Icon className="size-[1.125rem]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-pretty text-sm font-bold text-[#0f1f3d] sm:text-[0.9375rem]">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-red-600 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!expanded}
        className="border-t border-red-100 bg-red-50/60 px-4 pb-4 pt-3 sm:px-4"
      >
        <div className="flex gap-3">
          {item.id === 'garantia' ? (
            <Award
              className="mt-0.5 size-5 shrink-0 text-red-600"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : null}
          <p className="text-pretty text-sm leading-relaxed text-[#0f1f3d]/85">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export function HomeFaqSection() {
  const [openId, setOpenId] = useState<string | null>(HOME_FAQ_ITEMS[0]?.id ?? null);

  return (
    <section
      aria-labelledby="faq-titulo"
      className="border-t border-border/60 bg-white py-8 sm:py-10"
    >
      <div className="container">
        <header className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-xs">
              Resolvemos tus dudas
            </p>
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
          </div>

          <h2
            id="faq-titulo"
            className="mt-3 text-balance text-2xl font-bold tracking-tight text-[#0f1f3d] sm:mt-4 sm:text-3xl lg:text-[2rem]"
          >
            Preguntas{' '}
            <span className="text-red-600">frecuentes</span>
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
            Respuestas rápidas sobre garantía, entrega, facturación y soporte antes de tu compra.
          </p>
        </header>

        <ul
          className="mx-auto grid max-w-5xl list-none grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
          role="list"
        >
          {HOME_FAQ_ITEMS.map((item) => (
            <li key={item.id}>
              <FaqItem
                item={item}
                expanded={openId === item.id}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
              />
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-6 flex max-w-5xl justify-center sm:mt-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2.5 text-sm text-muted-foreground shadow-sm">
            <Headphones className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            <span>
              ¿No encuentras lo que buscas?{' '}
              <Link
                to="/contacto"
                className="font-bold text-red-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                Contáctanos
              </Link>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
