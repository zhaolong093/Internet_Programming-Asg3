import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/stores/product-store";
import { useCartStore } from "@/stores/cart-store";

export const Route = createFileRoute("/store/")({
  head: () => ({ meta: [{ title: "Shop — Lreturns" }] }),
  component: StorePage,
});

function StorePage() {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const loadProducts = useProductStore((s) => s.loadProducts);
  const cartError = useCartStore((s) => s.error);
  const { items, add, updateQty } = useCartStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  function handleAdd(p: (typeof products)[0]) {
    if (p.stock === 0) return;
    add({ id: p.id, name: p.name, price: p.price, sku: p.sku, category: p.category });
    toast.success(`${p.name} added to cart.`);
  }

  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-background px-8 py-10 shadow-sm dark:from-primary/20 dark:via-card dark:to-background">
        {" "}
        <h1 className="font-display text-3xl font-bold">Welcome to Lreturns Shop</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our catalog and enjoy hassle-free returns.
        </p>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="sticky top-[64px] z-30 flex items-center justify-between rounded-xl border bg-primary px-5 py-3 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold">${cartTotal.toFixed(2)}</span>
            <Link to="/store/cart">
              <Button size="sm" variant="secondary">
                View Cart →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeCategory === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {loading ? "Loading products..." : `${filtered.length} products`}
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {cartError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {cartError}
        </div>
      )}

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
          <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const inCart = items.find((i) => i.id === p.id);
            const outOfStock = p.stock === 0;
            return (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-44 items-center justify-center bg-muted/50 dark:bg-background/45">
                  <Package className="h-16 w-16 text-muted-foreground/25" />{" "}
                  <Package className="h-16 w-16 text-muted-foreground/20" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <Badge variant="secondary" className="mb-2 self-start text-[11px]">
                    {p.category}
                  </Badge>
                  <h4 className="font-display font-semibold leading-snug">{p.name}</h4>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xl font-bold">${p.price.toLocaleString()}</span>
                    <span
                      className={`text-xs font-medium ${outOfStock ? "text-destructive" : "text-success"}`}
                    >
                      {outOfStock ? "Out of stock" : "In stock"}
                    </span>
                  </div>
                  {inCart ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-1.5">
                      <button
                        onClick={() => updateQty(p.id, -1)}
                        className="rounded p-1 hover:bg-accent"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-semibold">{inCart.qty} in cart</span>
                      <button
                        onClick={() => updateQty(p.id, 1)}
                        className="rounded p-1 hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      className="mt-3 w-full"
                      size="sm"
                      disabled={outOfStock}
                      onClick={() => handleAdd(p)}
                    >
                      <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
