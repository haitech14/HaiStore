import { BrandStrip } from '@/components/brand-strip';
import { printerBrands } from '@/data/brands';

export function FooterBrandsSection() {
  return (
    <section
      aria-labelledby="marcas-footer-titulo"
      className="border-b border-border bg-background"
    >
      <div className="container pt-5 pb-2 text-center sm:pt-6">
        <h2
          id="marcas-footer-titulo"
          className="text-balance text-sm font-semibold tracking-wide text-foreground sm:text-base"
        >
          Trabajamos con las mejores marcas
        </h2>
      </div>
      <BrandStrip
        brands={printerBrands}
        variant="default"
        showHeading={false}
        linkable={false}
        marquee
        className="pb-4 sm:pb-5"
      />
    </section>
  );
}
