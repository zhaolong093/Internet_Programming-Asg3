import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  RotateCcw,
  Users,
  Package,
  BarChart3,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar } from "@/components/common/Avatar";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/returns", label: "Returns", icon: RotateCcw },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/carts", label: "Carts", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside
      className={cn(
        "no-print sticky top-0 hidden h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {collapsed ? <LogoMark className="h-9 w-9 text-lg" /> : <Logo size="md" />}
        <button
          onClick={toggle}
          className={cn(
            "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            collapsed && "absolute right-2 top-3",
          )}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {items.map((it) => {
          const active = path === it.to || path.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center",
              )}
              title={collapsed ? it.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <it.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{it.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          className={cn(
            "mb-3 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent",
            collapsed && "justify-center",
          )}
        >
          <HelpCircle className="h-4 w-4" />
          {!collapsed && "Help & Support"}
        </button>
        {user && (
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-md bg-muted/40 p-2",
              collapsed && "justify-center",
            )}
          >
            <Avatar name={user.name} size="sm" />
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{user.name}</div>
                <div className="truncate text-[11px] capitalize text-muted-foreground">
                  {user.role}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileTabBar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const five = items.filter((i) => i.to !== "/products");
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 flex border-t bg-card lg:hidden">
      {five.map((it) => {
        const active = path === it.to || path.startsWith(it.to + "/");
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <it.icon className="h-5 w-5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
