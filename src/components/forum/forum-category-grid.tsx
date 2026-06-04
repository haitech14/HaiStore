import { Link } from 'react-router-dom';

import { getForumCategoryIcon, formatForumCount } from '@/lib/forum-utils';
import { cn } from '@/lib/utils';
import type { ForumCategory } from '@/types/forum';

interface ForumCategoryGridProps {
  categories: ForumCategory[];
}

export function ForumCategoryGrid({ categories }: ForumCategoryGridProps) {
  return (
    <section aria-labelledby="forum-categories-title" className="container px-4 py-8 sm:px-6">
      <h2 id="forum-categories-title" className="sr-only">
        Categorías del foro
      </h2>
      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
        role="list"
      >
        {categories.map((category) => {
          const Icon = getForumCategoryIcon(category.iconKey);
          return (
            <li key={category.id}>
              <Link
                to={`/foro/categoria/${category.slug}`}
                className={cn(
                  'flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-[hsl(var(--forum-border))]',
                  'bg-[hsl(var(--forum-card))] p-3 text-center transition-colors',
                  'hover:border-[hsl(var(--forum-accent)/0.5)] hover:bg-[hsl(var(--forum-card-hover))]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-lg text-white',
                    category.accentClass,
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold leading-snug sm:text-sm">{category.name}</span>
                <span className="text-[0.65rem] text-[hsl(var(--forum-muted))] sm:text-xs">
                  {formatForumCount(category.threadCount)} temas
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
