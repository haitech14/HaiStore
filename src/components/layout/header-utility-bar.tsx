import {
  HEADER_UTILITY_LEFT_ITEMS,
  HEADER_UTILITY_RIGHT_ITEMS,
} from '@/data/site-header';
import { cn } from '@/lib/utils';

function UtilityItem({
  item,
}: {
  item: (typeof HEADER_UTILITY_LEFT_ITEMS)[number];
}) {
  const IconComponent = item.icon;
  const content = (
    <>
      <IconComponent
        className="size-3.5 shrink-0 text-red-600 sm:size-4"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap font-medium text-white/90">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {content}
      </a>
    );
  }

  return <span className="inline-flex items-center gap-1.5">{content}</span>;
}

function UtilityGroup({
  items,
  className,
}: {
  items: typeof HEADER_UTILITY_LEFT_ITEMS;
  className?: string;
}) {
  return (
    <ul className={cn('flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-6', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <UtilityItem item={item} />
        </li>
      ))}
    </ul>
  );
}

export function HeaderUtilityBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'hidden border-b border-white/10 bg-black lg:block',
        className,
      )}
    >
      <div className="container flex min-h-9 items-center justify-between gap-4 py-2 text-xs sm:text-[0.8125rem]">
        <UtilityGroup items={HEADER_UTILITY_LEFT_ITEMS} />
        <UtilityGroup items={HEADER_UTILITY_RIGHT_ITEMS} className="shrink-0 justify-end" />
      </div>
    </div>
  );
}
