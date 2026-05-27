import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { API_BASE, apiHeaders } from "@/lib/api";
import type { CartItem } from "@/stores/cart-store";

export const Route = createFileRoute("/_app/carts")({
  head: () => ({ meta: [{ title: "Active Carts - Lreturns" }] }),
  component: CartsPage,
});

interface CustomerCart {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  updatedAt: string;
}

function CartsPage() {
  const [carts, setCarts] = useState<CustomerCart[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCarts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/carts`, { headers: apiHeaders() });
      if (!response.ok) throw new Error("Could not load active carts.");
      setCarts(await response.json());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load active carts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCarts();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return carts;
    return carts.filter(
      (cart) =>
        cart.customerName.toLowerCase().includes(query) ||
        cart.customerEmail.toLowerCase().includes(query) ||
        cart.items.some((item) => item.name.toLowerCase().includes(query)),
    );
  }, [carts, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Carts"
        subtitle="View shopping carts currently saved by signed-in customers."
        actions={
          <Button variant="outline" onClick={loadCarts} disabled={loading}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customer or product..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card py-24 text-center text-muted-foreground">
          Loading carts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-24 text-center">
          <ShoppingCart className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No active customer carts found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="grid grid-cols-[2fr_3fr_1fr_1fr] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase text-muted-foreground">
            <span>Customer</span>
            <span>Products</span>
            <span>Items</span>
            <span>Total</span>
          </div>
          {filtered.map((cart) => {
            const itemCount = cart.items.reduce((total, item) => total + item.qty, 0);
            const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
            return (
              <div
                key={cart.id}
                className="grid grid-cols-[2fr_3fr_1fr_1fr] items-center gap-4 border-t px-5 py-4"
              >
                <div>
                  <p className="font-medium">{cart.customerName}</p>
                  <p className="text-xs text-muted-foreground">{cart.customerEmail}</p>
                </div>
                <div className="space-y-1 text-sm">
                  {cart.items.map((item) => (
                    <p key={item.id}>
                      {item.name} <span className="text-muted-foreground">x {item.qty}</span>
                    </p>
                  ))}
                </div>
                <p className="text-sm">{itemCount}</p>
                <p className="font-semibold">${total.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
