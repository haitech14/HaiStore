import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ForumCategory, ForumSortValue, ForumThread } from '@/types/forum';

interface ForumDiscussionsPanelProps {
  threads: ForumThread[];
  categories: ForumCategory[];
  categoryFilter: string;
  sort: ForumSortValue;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: ForumSortValue) => void;
  isLoading?: boolean;
}

export function ForumDiscussionsPanel({
  threads,
  categories,
  categoryFilter,
  sort,
  onCategoryChange,
  onSortChange,
  isLoading,
}: ForumDiscussionsPanelProps) {
  return (
    <section
      aria-labelledby="forum-discussions-title"
      className="rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 border-b border-[hsl(var(--forum-border))] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="forum-discussions-title" className="text-lg font-bold">
          Discusiones recientes
        </h2>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter || 'all'} onValueChange={onCategoryChange}>
            <SelectTrigger
              className="h-10 min-w-[10rem] border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg))] text-[hsl(var(--forum-fg))]"
              aria-label="Filtrar por categoría"
            >
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => onSortChange(value as ForumSortValue)}>
            <SelectTrigger
              className="h-10 min-w-[9rem] border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg))] text-[hsl(var(--forum-fg))]"
              aria-label="Ordenar discusiones"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
          Cargando discusiones…
        </p>
      ) : threads.length === 0 ? (
        <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
          No hay temas que coincidan con tu búsqueda.
        </p>
      ) : (
        <div>{threads.map((thread) => (
          <ForumDiscussionRow key={thread.id} thread={thread} />
        ))}</div>
      )}

      <div className="pt-4 text-center">
        <Link
          to="/foro"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[hsl(var(--forum-accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
        >
          Ver más temas
          <ChevronDown className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
