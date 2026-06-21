import AdminShell from "@/components/admin/AdminShell";
import RoleRoute from "@/components/shared/RoleRoute";

export default function AdminLayout({ children }) {
  return (
    <RoleRoute allowedRoles={["admin"]} redirectTo="/dashboard">
      <AdminShell>{children}</AdminShell>
    </RoleRoute>
  );
}
