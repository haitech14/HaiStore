import type { ProductDescriptionContent } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductDetailDescriptionProps {
  content: ProductDescriptionContent;
  /** Evita repetir el resumen ya mostrado en ProductDetailDescriptionPanel. */
  omitPanelSummary?: boolean;
}

export function ProductDetailDescription({
  content,
  omitPanelSummary = false,
}: ProductDetailDescriptionProps) {
  const overviewParagraphs =
    content.overviewParagraphs && content.overviewParagraphs.length > 0
      ? content.overviewParagraphs
      : content.paragraphs.slice(0, 2);
  const paragraphs = omitPanelSummary
    ? content.paragraphs.filter((paragraph) => !overviewParagraphs.includes(paragraph))
    : content.paragraphs;
  const highlights = omitPanelSummary ? content.highlights.slice(4) : content.highlights;
  const primaryHighlights = highlights.slice(0, 3);
  const secondaryHighlights = highlights.slice(3);
  const hasYoutube = Boolean(content.youtubeVideoId);
  const hasBody = paragraphs.length > 0 || hasYoutube || highlights.length > 0;

  if (!hasBody) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-sm leading-relaxed text-neutral-600 sm:text-[0.9375rem]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {content.youtubeVideoId && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${content.youtubeVideoId}`}
              title={content.youtubeTitle ?? 'Video del producto'}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          {content.youtubeTitle && (
            <p className="border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
              {content.youtubeTitle}
            </p>
          )}
        </div>
      )}

      {highlights.length > 0 && (
        <div className="space-y-3">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {primaryHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <li
                  key={highlight.title}
                  className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-4 py-5 text-center"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-neutral-900">{highlight.title}</p>
                  <p className="mt-1 text-xs leading-snug text-neutral-500">{highlight.subtitle}</p>
                </li>
              );
            })}
          </ul>

          {secondaryHighlights.length > 0 && (
            <ul
              className={cn(
                'grid grid-cols-1 gap-3',
                secondaryHighlights.length === 2 && 'sm:mx-auto sm:max-w-2xl sm:grid-cols-2',
              )}
            >
              {secondaryHighlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <li
                    key={highlight.title}
                    className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-4 py-5 text-center"
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                      <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-bold text-neutral-900">{highlight.title}</p>
                    <p className="mt-1 text-xs leading-snug text-neutral-500">{highlight.subtitle}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
