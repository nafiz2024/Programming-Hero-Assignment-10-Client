import BenefitsSection from "@/components/marketing/BenefitsSection";
import CategorySection from "@/components/marketing/CategorySection";
import CreatorCtaSection from "@/components/marketing/CreatorCtaSection";
import HeroSection from "@/components/marketing/HeroSection";
import PromptPreviewSection from "@/components/marketing/PromptPreviewSection";
import StatsSection from "@/components/marketing/StatsSection";
import PageContainer from "@/components/shared/PageContainer";

export default function Home() {
  return (
    <PageContainer as="section" className="space-y-14 pb-16 md:space-y-18 md:pb-20 desktop:space-y-20" size="xl">
      <HeroSection />
      <StatsSection />
      <CategorySection />
      <PromptPreviewSection />
      <BenefitsSection />
      <CreatorCtaSection />
    </PageContainer>
  );
}
