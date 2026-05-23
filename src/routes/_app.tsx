import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar, MobileTabBar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/common/CommandPalette";
import { NotificationPanel } from "@/components/common/NotificationPanel";
import { useAuthStore } from "@/stores/auth-store";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

function AppShell() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  // Navigation MUST be in useEffect — never during render
  useEffect(() => {
    if (!ready) return;
    if (!isAuth) {
      window.location.replace("/login");
      return;
    }
    if (role === "customer") {
      window.location.replace("/store");
    }
  }, [ready, isAuth, role]);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!isAuth || role === "customer") return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AppSidebar />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMobileMenu={() => setMobileOpen(true)} />
        <main className="lr-page-enter mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
      <CommandPalette />
      <NotificationPanel />
    </div>
  );
}