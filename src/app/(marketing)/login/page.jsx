import PageContainer from "@/components/shared/PageContainer";
import SectionHeader from "@/components/shared/SectionHeader";

export default function LoginPage() {
  return (
    <PageContainer as="section" className="py-16" size="md">
      <SectionHeader
        description="Authentication screens are intentionally deferred. This route is a placeholder for shell validation."
        eyebrow="Placeholder"
        title="Login"
      />
    </PageContainer>
  );
}
