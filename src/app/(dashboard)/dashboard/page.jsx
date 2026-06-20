import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeader from "@/components/shared/SectionHeader";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <PageContainer as="section" className="px-0 py-0" size="xl">
        <SectionHeader
          description="Dashboard content is intentionally postponed. This route now uses the reusable sidebar and shell only."
          eyebrow="Dashboard"
          title="Overview Placeholder"
        />
      </PageContainer>
    </ProtectedRoute>
  );
}
