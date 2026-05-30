import { BrandStrip } from '@/components/brand-strip';
import { BusinessSolutionsSection } from '@/components/business-solutions-section';
import { CategoryStrip } from '@/components/category-strip';
import { FeaturedProducts } from '@/components/featured-products';
import { GuidesSection } from '@/components/guides-section';
import { HeroBanner } from '@/components/hero-banner';
import { Newsletter } from '@/components/newsletter';
import { PromoBanners } from '@/components/promo-banners';
import { TrustBar } from '@/components/trust-bar';
import { printerBrands } from '@/data/brands';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />

      <div className="container py-10 sm:py-12">
        <FeaturedProducts />
      </div>

      <BusinessSolutionsSection />

      <div className="container py-10 sm:py-12">
        <Newsletter />
      </div>

      <div className="container flex flex-col gap-14 pb-12 sm:pb-16">
        <PromoBanners />
        <BrandStrip brands={printerBrands} />
        <TrustBar />
        <GuidesSection />
      </div>
    </div>
  );
}
