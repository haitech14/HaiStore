import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatForumEventDate, formatForumRelativeTime } from '@/lib/forum-utils';
import type { ForumEvent, ForumLatestPost, ForumMember, ForumPopularTopic } from '@/types/forum';

interface ForumSidebarProps {
  popularTopics: ForumPopularTopic[];
  featuredMembers: ForumMember[];
  events: ForumEvent[];
  latestPosts: ForumLatestPost[];
}

function WidgetCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--forum-muted))]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ForumSidebar({
  popularTopics,
  featuredMembers,
  events,
  latestPosts,
}: ForumSidebarProps) {
  return (
    <aside className="space-y-4" aria-label="Panel lateral del foro">
      <WidgetCard title="Temas populares">
        <ol className="space-y-2">
          {popularTopics.map((topic) => (
            <li key={topic.slug} className="flex gap-2 text-sm">
              <span className="w-5 shrink-0 font-bold text-[hsl(var(--forum-accent))]">
                {topic.rank}
              </span>
              <Link
                to={`/foro/tema/${topic.slug}`}
                className="min-w-0 flex-1 text-[hsl(var(--forum-fg))] hover:text-[hsl(var(--forum-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
              >
                <span className="line-clamp-2">{topic.title}</span>
                <span className="text-xs text-[hsl(var(--forum-muted))]">
                  {topic.replyCount} respuestas
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </WidgetCard>

      <WidgetCard title="Miembros destacados">
        <ul className="space-y-3">
          {featuredMembers.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-[hsl(var(--forum-accent)/0.15)] text-xs font-semibold text-[hsl(var(--forum-accent))]">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="truncate text-xs text-[hsl(var(--forum-muted))]">
                  {member.forumTitle ?? 'Colaborador activo'}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Crown className="size-3.5" aria-hidden="true" />
                {member.forumPoints}
              </span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Eventos próximos">
        <ul className="space-y-3">
          {events.map((event) => {
            const { month, day } = formatForumEventDate(event.startsAt);
            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg))] text-center">
                  <span className="text-[0.6rem] uppercase text-[hsl(var(--forum-muted))]">
                    {month}
                  </span>
                  <span className="text-sm font-bold leading-none">{day}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">{event.title}</p>
                  <p className="text-xs text-[hsl(var(--forum-muted))]">{event.location}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      <WidgetCard title="Últimas publicaciones">
        <ul className="space-y-3">
          {latestPosts.map((post) => (
            <li key={post.id}>
              <Link
                to={`/foro/tema/${post.threadSlug}`}
                className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
              >
                <p className="text-sm font-medium leading-snug hover:text-[hsl(var(--forum-accent))]">
                  {post.threadTitle}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[hsl(var(--forum-muted))]">
                  {post.excerpt}
                </p>
                <p className="mt-1 text-[0.65rem] text-[hsl(var(--forum-muted))]">
                  {post.authorName} · {formatForumRelativeTime(post.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </WidgetCard>
    </aside>
  );
}
