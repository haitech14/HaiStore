import { Link } from 'react-router-dom';

import { getForumCategoryIcon, formatForumRelativeTime } from '@/lib/forum-utils';
import { cn } from '@/lib/utils';
import type { ForumThread } from '@/types/forum';

interface ForumDiscussionRowProps {
  thread: ForumThread;
}

export function ForumDiscussionRow({ thread }: ForumDiscussionRowProps) {
  const Icon = getForumCategoryIcon(thread.category?.iconKey ?? 'message-square');

  return (
    <article className="grid gap-3 border-b border-[hsl(var(--forum-border))] py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
      <div className="flex min-w-0 gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-white',
            thread.category?.accentClass ?? 'bg-sky-500',
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug sm:text-base">
            <Link
              to={`/foro/tema/${thread.slug}`}
              className="text-[hsl(var(--forum-fg))] hover:text-[hsl(var(--forum-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
            >
              {thread.title}
            </Link>
          </h3>
          {thread.tags.length > 0 ? (
            <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Etiquetas">
              {thread.tags.map((tag) => (
                <li key={tag}>
                  <span className="rounded-md bg-[hsl(var(--forum-accent)/0.12)] px-2 py-0.5 text-[0.65rem] font-medium text-[hsl(var(--forum-accent))]">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs text-[hsl(var(--forum-muted))]">
            por {thread.author?.name ?? 'Anónimo'} · {formatForumRelativeTime(thread.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:text-right">
        <dl className="flex gap-4 text-xs sm:flex-col sm:gap-1 sm:text-right">
          <div>
            <dt className="sr-only">Respuestas</dt>
            <dd className="font-semibold text-[hsl(var(--forum-fg))]">{thread.replyCount}</dd>
            <dd className="text-[hsl(var(--forum-muted))]">Respuestas</dd>
          </div>
          <div>
            <dt className="sr-only">Vistas</dt>
            <dd className="font-semibold text-[hsl(var(--forum-fg))]">{thread.viewCount}</dd>
            <dd className="text-[hsl(var(--forum-muted))]">Vistas</dd>
          </div>
        </dl>
        <p className="text-xs text-[hsl(var(--forum-muted))]">
          {formatForumRelativeTime(thread.lastReplyAt ?? thread.createdAt)}
          {thread.lastReplyAuthor ? ` por ${thread.lastReplyAuthor.name}` : ''}
          <span
            className="ml-1 inline-block size-2 rounded-full bg-[hsl(var(--forum-accent))]"
            aria-hidden="true"
          />
        </p>
      </div>
    </article>
  );
}
