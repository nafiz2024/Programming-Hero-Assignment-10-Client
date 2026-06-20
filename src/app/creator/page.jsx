import RoleRoute from "@/components/shared/RoleRoute";

export default function CreatorPage() {
  return (
    <RoleRoute allowedRoles={["creator", "admin"]}>
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Creator</h1>
      </main>
    </RoleRoute>
  );
}
