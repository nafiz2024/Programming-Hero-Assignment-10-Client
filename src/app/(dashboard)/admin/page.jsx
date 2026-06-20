import RoleRoute from "@/components/shared/RoleRoute";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeader from "@/components/shared/SectionHeader";

export default function AdminPage() {
  return (
    <RoleRoute allowedRoles={["admin"]}>
      <PageContainer as="section" className="px-0 py-0" size="xl">
        <SectionHeader
          description="Admin tools are not built in this step. This is a placeholder route inside the reusable dashboard shell."
          eyebrow="Admin"
          title="Admin Placeholder"
        />
      </PageContainer>
    </RoleRoute>
  );
}
