import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, CreditCard, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";

export const Route = createFileRoute("/store/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Lreturns" }] }),
  component: CheckoutPage,
});

type Step = "address" | "payment" | "done";
const emptyAddress = { fullName: "", line1: "", line2: "", city: "", state: "", postcode: "", country: "Australia", phone: "" };
const emptyPayment = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

function CheckoutPage() {
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { items, clear } = useCartStore();
  const [step, setStep] = useState<Step>("address");
  const [address, setAddr] = useState({ ...emptyAddress, fullName: user?.name ?? "" });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [payment, setPay] = useState(emptyPayment);
  const [payErrors, setPayErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderNum] = useState(() => "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const saveOrder = useOrderStore((s) => s.placeOrder);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal * 1.1;

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuth) { toast.error("Please sign in to checkout."); navigate({ to: "/login" }); }
    if (isAuth && items.length === 0 && step !== "done") navigate({ to: "/store" });
  }, [isAuth, items.length, navigate, step]);

  function validateAddress() {
    const e: Record<string, string> = {};
    if (!address.fullName.trim()) e.fullName = "Required.";
    if (!address.line1.trim()) e.line1 = "Required.";
    if (!address.city.trim()) e.city = "Required.";
    if (!address.state.trim()) e.state = "Required.";
    if (!address.postcode.trim()) e.postcode = "Required.";
    if (!address.phone.trim()) e.phone = "Required.";
    setAddrErrors(e);
    return Object.keys(e).length === 0;
  }

  function validatePayment() {
    const e: Record<string, string> = {};
    if (!payment.cardName.trim()) e.cardName = "Required.";
    if (payment.cardNumber.replace(/\s/g, "").length !== 16) e.cardNumber = "Enter a valid 16-digit number.";
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) e.expiry = "Use MM/YY format.";
    if (payment.cvv.length < 3) e.cvv = "Enter 3–4 digits.";
    setPayErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder_fn() {
    if (!validatePayment()) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = subtotal * 1.1;
    // [BACKEND HOOK] POST /api/orders
    saveOrder({
      customerName: user?.name ?? "Guest",
      customerEmail: user?.email ?? "",
      items: items.map((i) => ({ id: i.id, name: i.name, sku: i.sku, qty: i.qty, price: i.price })),
      subtotal,
      tax: subtotal * 0.1,
      total,
      address: {
        fullName: address.fullName,
        line1: address.line1,
        city: address.city,
        state: address.state,
        postcode: address.postcode,
        country: address.country,
      },
      adminNote: ""
    });
    clear();
    setStep("done");
    setPlacing(false);
  }

  if (step === "done") return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/15 mb-6">
        <CheckCircle2 className="h-12 w-12 text-success" />
      </div>
      <h2 className="font-display text-3xl font-bold">Order Confirmed!</h2>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Thank you! We'll send a confirmation to <span className="font-medium text-foreground">{user?.email}</span>.
      </p>
      <div className="mt-8 rounded-xl border bg-card px-8 py-6 shadow-sm text-sm space-y-2 text-left min-w-[260px]">
        <div className="text-center font-mono font-bold text-primary text-lg mb-3">{orderNum}</div>
        <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{address.fullName}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Deliver to</span><span className="font-medium">{address.city}, {address.state}</span></div>
        <div className="border-t pt-2 flex justify-between font-bold"><span>Total paid</span><span>${total.toFixed(2)}</span></div>
      </div>
      <Link to="/store" className="mt-8"><Button size="lg">Continue Shopping</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-4">
        {step === "payment" && (
          <Button variant="ghost" size="sm" onClick={() => setStep("address")}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        )}
        {step === "address" && (
          <Link to="/store/cart"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Cart</Button></Link>
        )}
        <div className="flex items-center gap-2">
          {(["address", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step === s ? "bg-primary text-primary-foreground" : i < (step === "payment" ? 1 : 0) ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < (step === "payment" ? 1 : 0) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium capitalize ${step === s ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i === 0 && <div className="mx-2 h-px w-8 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {step === "address" ? (
            <>
              <div className="mb-5 flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Address
              </div>
              <div className="space-y-4">
                <Field label="Full Name" id="fn" value={address.fullName} error={addrErrors.fullName} onChange={(v) => setAddr((a) => ({ ...a, fullName: v }))} placeholder="Jane Smith" />
                <Field label="Address Line 1" id="l1" value={address.line1} error={addrErrors.line1} onChange={(v) => setAddr((a) => ({ ...a, line1: v }))} placeholder="123 Main Street" />
                <Field label="Address Line 2" id="l2" value={address.line2} onChange={(v) => setAddr((a) => ({ ...a, line2: v }))} placeholder="Apt, unit (optional)" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" id="city" value={address.city} error={addrErrors.city} onChange={(v) => setAddr((a) => ({ ...a, city: v }))} placeholder="Sydney" />
                  <Field label="State" id="state" value={address.state} error={addrErrors.state} onChange={(v) => setAddr((a) => ({ ...a, state: v }))} placeholder="NSW" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Postcode" id="pc" value={address.postcode} error={addrErrors.postcode} onChange={(v) => setAddr((a) => ({ ...a, postcode: v }))} placeholder="2000" />
                  <Field label="Phone" id="ph" value={address.phone} error={addrErrors.phone} onChange={(v) => setAddr((a) => ({ ...a, phone: v }))} placeholder="+61 4xx xxx xxx" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <select id="country" value={address.country} onChange={(e) => setAddr((a) => ({ ...a, country: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {["Australia", "New Zealand", "United States", "United Kingdom", "Canada", "Singapore"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Button className="w-full" onClick={() => { if (validateAddress()) setStep("payment"); }}>
                  Continue to Payment <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-2 font-medium">
                <CreditCard className="h-4 w-4 text-primary" /> Payment Details
              </div>
              <div className="space-y-4">
                <Field label="Name on Card" id="cn" value={payment.cardName} error={payErrors.cardName} onChange={(v) => setPay((p) => ({ ...p, cardName: v }))} placeholder="Jane Smith" />
                <div className="space-y-1.5">
                  <Label htmlFor="cardnum">Card Number</Label>
                  <Input id="cardnum" inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456"
                    value={payment.cardNumber}
                    onChange={(e) => setPay((p) => ({ ...p, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() }))} />
                  {payErrors.cardNumber && <p className="text-xs text-destructive">{payErrors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp">Expiry</Label>
                    <Input id="exp" placeholder="MM/YY" maxLength={5} inputMode="numeric" value={payment.expiry}
                      onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(0, 4); setPay((p) => ({ ...p, expiry: c.length >= 3 ? c.slice(0, 2) + "/" + c.slice(2) : c })); }} />
                    {payErrors.expiry && <p className="text-xs text-destructive">{payErrors.expiry}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="•••" maxLength={4} inputMode="numeric" value={payment.cvv}
                      onChange={(e) => setPay((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                    {payErrors.cvv && <p className="text-xs text-destructive">{payErrors.cvv}</p>}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">🔒 Demo only — no real payment is processed.</p>
                <Button className="w-full" disabled={placing} onClick={placeOrder_fn}>
                  {placing ? "Placing Order…" : `Place Order · $${total.toFixed(2)}`}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Order recap sidebar */}
        <div className="rounded-xl border bg-card p-5 shadow-sm h-fit sticky top-24 space-y-3">
          <h3 className="font-display text-sm font-semibold">Your Order</h3>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2">{i.name} × {i.qty}</span>
              <span className="shrink-0 font-medium">${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success font-medium">Free</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax (10%)</span><span>${(subtotal * 0.1).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold pt-1 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, value, onChange, placeholder, error }: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}