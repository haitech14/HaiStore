import { CategoryStrip } from '@/components/category-strip';
import { ClientRecommendationsSection } from '@/components/client-recommendations-section';
import { ClientsSection } from '@/components/clients-section';
import { HeroBanner } from '@/components/hero-banner';
import { HomeTrustStrip } from '@/components/home-trust-strip';
import { HomeEquipmentAdvisorSection } from '@/components/home-equipment-advisor-section';
import { HomeFaqSection } from '@/components/home-faq-section';
import { HomeHighlightedSection } from '@/components/home-highlighted-section';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />
      <HomeHighlightedSection />

      <FooterBrandsSection />

      <ClientRecommendationsSection />

      <ClientsSection />
      <HomeTrustStrip />
      <HomeFaqSection />
      <HomeEquipmentAdvisorSection />
    </div>
  );
}
