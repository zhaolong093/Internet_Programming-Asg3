import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Camera, Check, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, ReasonBadge } from "@/components/common/StatusBadge";
import { Avatar } from "@/components/common/Avatar";
import { returns, customers } from "@/lib/mock/data";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/returns/$id")({
  component: ReturnDetail,
});

const STEPS = ["Submitted", "Under Review", "Decision", "Refunded"] as const;

function ReturnDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const r = returns.find((x) => x.id === id) ?? returns[0];
  const customer = customers.find((c) => c.id === r.customer.id) ?? customers[0];
  const stepIdx = r.status === "refunded" ? 3 : r.status === "approved" || r.status === "rejected" ? 2 : r.status === "processing" ? 1 : 0;
  const [restock, setRestock] = useState(15);
  const [shipDeduct, setShipDeduct] = useState(false);
  const [note, setNote] = useState("");
  const total = Math.max(0, r.refundAmount - (r.refundAmount * restock) / 100 - (shipDeduct ? 9.99 : 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/returns" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Returns</Link>
          <span>›</span>
          <span className="font-mono text-foreground">{r.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} large />
          <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => toast.success("Approved")}><Check className="mr-1 h-4 w-4" />Approve</Button>
          <Button variant="outline" onClick={() => toast.message("Rejected")}><X className="mr-1 h-4 w-4" />Reject</Button>
          <Button variant="ghost" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" />Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">{r.id}</h2>
                <p className="text-xs text-muted-foreground">Submitted {format(new Date(r.submittedAt), "PPpp")} · Updated {format(new Date(r.updatedAt), "PP")}</p>
              </div>
            </div>
            <ol className="mt-6 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                  <div className={`text-xs ${i <= stepIdx ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < stepIdx ? "bg-primary" : "bg-muted"}`} />}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-display text-base font-semibold">Product Details</h3>
            <div className="mt-4 flex gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">Image</div>
              <div className="text-sm">
                <div className="font-medium">{r.product.name}</div>
                <div className="text-muted-foreground">SKU {r.product.sku} · {r.product.variant}</div>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <div>Qty: <span className="text-foreground">{r.qty}</span></div>
                  <div>Order: <span className="text-foreground">{r.orderId}</span></div>
                  <div>Purchased: <span className="text-foreground">{format(new Date(r.orderDate), "PP")}</span></div>
                  <div>Unit price: <span className="text-foreground">${r.product.price.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Return Reason</h3>
              <ReasonBadge reason={r.reason} />
            </div>
            <blockquote className="mt-3 border-l-4 border-primary/40 bg-muted/40 p-3 text-sm italic text-muted-foreground">"{r.explanation}"</blockquote>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Photo evidence</div>
              <div className="flex gap-3 overflow-x-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex h-24 w-32 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/40 text-xs text-muted-foreground">
                    <Camera className="mb-1 h-5 w-5" /> Photo {i}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-display text-base font-semibold">Activity & Notes</h3>
            <ul className="mt-4 space-y-3 border-l pl-4">
              <li className="relative text-sm"><span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-info" />Return submitted by {r.customer.name} · {format(new Date(r.submittedAt), "PP")}</li>
              {r.notes.map((n) => (
                <li key={n.id} className="relative text-sm">
                  <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex items-center gap-2"><Avatar size="sm" name={n.author} /><span className="font-medium">{n.author}</span><span className="text-xs text-muted-foreground">{format(new Date(n.createdAt), "PP")}</span></div>
                  <div className="mt-1 text-muted-foreground">{n.text}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <Textarea placeholder="Add internal note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex justify-end"><Button size="sm" onClick={() => { if (note.trim()) { toast.success("Note posted"); setNote(""); } }}>Post Note</Button></div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Customer</h3>
            <div className="mt-3 flex items-center gap-3"><Avatar name={customer.name} /><div><div className="font-medium">{customer.name}</div><div className="text-xs text-muted-foreground">{customer.email}</div></div></div>
            <div className="mt-3 grid grid-cols-1 gap-1 text-sm">
              <div className="text-muted-foreground">Phone: <span className="text-foreground">{customer.phone}</span></div>
              <div className="text-muted-foreground">Returns: <span className="text-foreground">{customer.totalReturns} previous</span></div>
              <div className="text-muted-foreground">Customer since {format(new Date(customer.customerSince), "PP")}</div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Order</h3>
            <div className="mt-3 grid grid-cols-1 gap-1 text-sm">
              <div className="text-muted-foreground">Order: <span className="text-foreground font-mono">{r.orderId}</span></div>
              <div className="text-muted-foreground">Date: <span className="text-foreground">{format(new Date(r.orderDate), "PP")}</span></div>
              <div className="text-muted-foreground">Address: <span className="text-foreground">{r.shippingAddress}</span></div>
              <div className="text-muted-foreground">Payment: <span className="text-foreground">{r.paymentMethod}</span></div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Refund Calculator</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Original price</dt><dd>${r.refundAmount.toFixed(2)}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-muted-foreground">Restocking fee</dt><dd className="flex items-center gap-1"><Input type="number" value={restock} onChange={(e) => setRestock(Number(e.target.value))} className="h-7 w-16 text-right" />%</dd></div>
              <div className="flex items-center justify-between"><dt className="text-muted-foreground">Shipping deduction</dt><dd><Checkbox checked={shipDeduct} onCheckedChange={(v) => setShipDeduct(!!v)} /></dd></div>
              <div className="flex justify-between border-t pt-3 font-display text-lg font-semibold text-success"><dt>Total Refund</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>
            <Button className="mt-4 w-full bg-success text-success-foreground hover:bg-success/90" onClick={() => toast.success(`Refund of $${total.toFixed(2)} issued`)}>Issue Refund</Button>
          </section>
        </aside>
      </div>
    </div>
  );
}