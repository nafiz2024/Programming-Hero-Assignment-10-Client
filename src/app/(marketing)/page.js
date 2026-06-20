import PageContainer from "@/components/shared/PageContainer";
import SectionHeader from "@/components/shared/SectionHeader";

export default function Home() {
  return (
    <PageContainer as="section" className="py-16" size="xl">
      <SectionHeader
        description="Landing page content is intentionally deferred. This step only establishes the shared design system and public layout shell."
        eyebrow="Step 7"
        title="Homepage Placeholder"
      />
    </PageContainer>
  );
}
