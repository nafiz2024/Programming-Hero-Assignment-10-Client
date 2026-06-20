import RoleRoute from "@/components/shared/RoleRoute";

export default function AdminPage() {
  return (
    <RoleRoute allowedRoles={["admin"]}>
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
      </main>
    </RoleRoute>
  );
}
