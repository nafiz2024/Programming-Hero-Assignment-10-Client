import PromptDetailsClient from "@/components/marketplace/PromptDetailsClient";
import PageContainer from "@/components/shared/PageContainer";

export default async function PromptDetailsPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer as="section" className="pb-16 pt-10 md:pb-20 md:pt-12" size="xl">
      <PromptDetailsClient promptId={id} />
    </PageContainer>
  );
}
