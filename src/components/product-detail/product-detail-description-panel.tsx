import { ProductDetailSpecsTable } from '@/components/product-detail/product-detail-specs-table';
import { cn } from '@/lib/utils';
import type { ProductDescriptionContent, ProductSpecRow } from '@/types/product-detail';

interface ProductDetailDescriptionPanelProps {
  content: ProductDescriptionContent;
  specs: ProductSpecRow[];
  sku?: string | null;
  className?: string;
}

export function ProductDetailDescriptionPanel({
  content,
  specs,
  sku,
  className,
}: ProductDetailDescriptionPanelProps) {
  const overviewTitle = content.overviewTitle ?? 'Productividad para tu oficina';
  const overviewParagraphs =
    content.overviewParagraphs && content.overviewParagraphs.length > 0
      ? content.overviewParagraphs
      : content.paragraphs.slice(0, 2);
  const highlights = content.highlights.slice(0, 4);

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start', className)}>
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-balance text-xl font-bold leading-tight text-[#0f1f3d] sm:text-2xl">
            {overviewTitle}
          </h2>
          {sku ? (
            <p className="font-mono text-xs text-muted-foreground sm:text-sm">{sku}</p>
          ) : null}
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
          {overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {highlights.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 border-t border-border/60 pt-5 sm:grid-cols-4 sm:gap-4">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <li key={highlight.title} className="flex flex-col items-center text-center">
                  <span className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-muted/20 text-muted-foreground">
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <p className="mt-2 text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
                    {highlight.title}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] leading-snug text-muted-foreground sm:text-xs">
                    {highlight.subtitle}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-24">
        <h3 className="mb-3 text-base font-bold text-[#0f1f3d] sm:text-lg">
          Especificaciones técnicas
        </h3>
        {specs.length > 0 ? (
          <ProductDetailSpecsTable specs={specs} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay especificaciones técnicas registradas para este producto.
          </p>
        )}
      </aside>
    </div>
  );
}
