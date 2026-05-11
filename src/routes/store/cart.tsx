import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Package, Minus, Plus, X, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/store/cart")({
  head: () => ({ meta: [{ title: "Cart — Lreturns" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, remove } = useCartStore();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/store">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Continue Shopping</Button>
        </Link>
        <h1 className="font-display text-2xl font-semibold">Your Cart</h1>
        {items.length > 0 && <span className="text-sm text-muted-foreground">{items.reduce((s, i) => s + i.qty, 0)} items</span>}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-24 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
          <Link to="/store" className="mt-4"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Cart items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                  <p className="text-sm font-medium text-primary">${item.price.toLocaleString()} each</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2 py-1">
                  <button onClick={() => updateQty(item.id, -1)} className="rounded p-0.5 hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="rounded p-0.5 hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="w-20 text-right font-bold">${(item.price * item.qty).toFixed(2)}</div>
                <button onClick={() => remove(item.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="rounded-xl border bg-card p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-display mb-4 text-base font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-muted-foreground">
                  <span className="truncate pr-2">{i.name} × {i.qty}</span>
                  <span className="shrink-0">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="my-3 border-t pt-2 space-y-1.5">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success font-medium">Free</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
            {isAuth ? (
              <Link to="/store/checkout" className="block mt-6">
                <Button className="w-full">
                  Proceed to Checkout <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="mt-6 space-y-3">
                <p className="text-center text-sm text-muted-foreground">You need to sign in to checkout.</p>
                <Link to="/login" className="block">
                  <Button className="w-full">Sign in to Checkout</Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="outline" className="w-full">Create Account</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}