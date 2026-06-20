import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
      </main>
    </ProtectedRoute>
  );
}
