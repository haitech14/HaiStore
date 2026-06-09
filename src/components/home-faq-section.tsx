import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { HOME_FAQ_ITEMS } from '@/data/home-faq';
import { cn } from '@/lib/utils';

function FaqItem({
  question,
  answer,
  expanded,
  onToggle,
}: {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const triggerId = useId();
  const panelId = useId();

  return (
    <div className="h-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <button
        type="button"
        id={triggerId}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:px-5"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1 text-pretty text-sm font-semibold text-foreground sm:text-[0.9375rem]">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
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
        className="border-t border-border/60 px-4 pb-4 pt-3 sm:px-5"
      >
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}

export function HomeFaqSection() {
  const [openId, setOpenId] = useState<string | null>(HOME_FAQ_ITEMS[0]?.id ?? null);

  return (
    <section
      aria-labelledby="faq-titulo"
      className="border-t border-border/60 bg-muted/15 py-6 sm:py-8"
    >
      <div className="container">
        <header className="mx-auto mb-5 max-w-3xl text-center sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-red-600 sm:w-12" aria-hidden="true" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-xs">
              Resolvemos tus dudas
            </p>
            <span className="h-px w-8 bg-red-600 sm:w-12" aria-hidden="true" />
          </div>

          <h2
            id="faq-titulo"
            className="mt-2.5 text-balance text-2xl font-bold tracking-tight text-foreground sm:mt-3 sm:text-3xl"
          >
            Preguntas frecuentes
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-2.5 sm:text-base">
            Respuestas rápidas sobre garantía, entrega, facturación y soporte antes de tu compra.
          </p>
        </header>

        <ul
          className="mx-auto grid max-w-5xl list-none grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 sm:gap-x-4"
          role="list"
        >
          {HOME_FAQ_ITEMS.map((item) => (
            <li key={item.id}>
              <FaqItem
                question={item.question}
                answer={item.answer}
                expanded={openId === item.id}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
              />
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-5 max-w-5xl text-center text-sm text-muted-foreground sm:mt-6">
          ¿No encuentras lo que buscas?{' '}
          <Link
            to="/contacto"
            className="font-semibold text-red-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            Contáctanos
          </Link>
        </p>
      </div>
    </section>
  );
}
