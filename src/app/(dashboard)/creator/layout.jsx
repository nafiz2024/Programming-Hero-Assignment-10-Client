import RoleRoute from "@/components/shared/RoleRoute";
import { CreatorProvider } from "@/providers/CreatorProvider";

export default function CreatorLayout({ children }) {
  return (
    <RoleRoute allowedRoles={["creator", "admin"]}>
      <CreatorProvider>{children}</CreatorProvider>
    </RoleRoute>
  );
}

