import MarketplaceClient from "@/components/marketplace/MarketplaceClient";
import PageContainer from "@/components/shared/PageContainer";

export default function PromptsPage() {
  return (
    <PageContainer as="section" className="pb-16 pt-10 md:pb-20 md:pt-12" size="xl">
      <MarketplaceClient />
    </PageContainer>
  );
}
