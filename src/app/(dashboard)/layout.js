import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { DashboardProvider } from "@/providers/DashboardProvider";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProvider>
    </ProtectedRoute>
  );
}
