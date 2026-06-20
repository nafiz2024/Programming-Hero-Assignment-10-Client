import RoleRoute from "@/components/shared/RoleRoute";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeader from "@/components/shared/SectionHeader";

export default function CreatorPage() {
  return (
    <RoleRoute allowedRoles={["creator", "admin"]}>
      <PageContainer as="section" className="px-0 py-0" size="xl">
        <SectionHeader
          description="Creator-facing screens are deferred for a later step. The route now inherits the reusable dashboard shell."
          eyebrow="Creator"
          title="Creator Placeholder"
        />
      </PageContainer>
    </RoleRoute>
  );
}
