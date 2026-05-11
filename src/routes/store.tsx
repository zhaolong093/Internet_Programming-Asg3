import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, RotateCcw, LogIn, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";

export const Route = createFileRoute("/store")({
  component: StoreShell,
});

function StoreShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.items.reduce((t, i) => t + i.qty, 0));
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Store Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/store">
            <Logo size="md" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/store" className={path === "/store" ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
              Shop
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/store/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm font-medium hover:bg-accent">
                  <User className="h-4 w-4" />
                  {user.name.split(" ")[0]}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-1 shadow-lg">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-1">{user.email}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline">
                  <LogIn className="mr-1.5 h-4 w-4" /> Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}