import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Sun, Moon, Menu, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/common/Avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { notifications } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/returns": "Returns Management",
  "/customers": "Customers",
  "/products": "Products",
  "/reports": "Reports & Analytics",
  "/settings": "Settings",
};

export function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setCmdk = useUIStore((s) => s.setCmdkOpen);
  const setNotif = useUIStore((s) => s.setNotifOpen);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  const title = Object.entries(titles).find(([k]) => path === k || path.startsWith(k + "/"))?.[1] ?? "Lreturns";
  const today = format(new Date(), "EEEE, d MMMM yyyy");
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMobileMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h2 className="font-display truncate text-base font-semibold leading-none">{title}</h2>
        <p className="mt-1 hidden text-xs text-muted-foreground md:block">{today}</p>
      </div>

      <button
        onClick={() => setCmdk(true)}
        className={cn(
          "hidden h-9 w-72 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition hover:border-ring md:flex",
        )}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search returns, customers…</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>

      <button
        onClick={() => setCmdk(true)}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      <button
        onClick={toggleTheme}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <button
        onClick={() => setNotif(true)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-accent">
            <Avatar name={user.name} size="sm" />
            <div className="hidden text-left md:block">
              <div className="text-xs font-medium leading-tight">{user.name}</div>
              <div className="text-[10px] capitalize text-muted-foreground">{user.role}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Toggle theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}