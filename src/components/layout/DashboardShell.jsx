"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";

import BottomNavigation from "@/components/layout/BottomNavigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Button from "@/components/ui/Button";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import PageContainer from "@/components/shared/PageContainer";
import { mobileDashboardNavLinks } from "@/lib/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function DashboardShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1200px)");

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <PageContainer as="div" className="py-5 md:py-6 desktop:py-8" size="xl">
        {!isDesktop ? (
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
            <div>
              <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Responsive Shell</p>
              <h1 className="text-h3">Dashboard Foundation</h1>
            </div>
            <Button
              aria-label="Open navigation"
              className="px-4"
              onPress={() => setIsSidebarOpen(true)}
              variant="secondary"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div className="grid gap-6 desktop:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden desktop:sticky desktop:top-24 desktop:block desktop:self-start">
            <Suspense fallback={<div className="pf-card h-[480px] rounded-lg" />}>
              <DashboardSidebar />
            </Suspense>
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </PageContainer>

      <ResponsiveDrawer isOpen={isSidebarOpen && !isDesktop} onClose={() => setIsSidebarOpen(false)} title="Navigation">
        <Suspense fallback={<div className="pf-card h-[420px] rounded-lg" />}>
          <DashboardSidebar />
        </Suspense>
      </ResponsiveDrawer>

      <BottomNavigation links={mobileDashboardNavLinks} />
    </div>
  );
}
