import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag, CheckCircle2, XCircle, Truck, Package2,
  Search, ChevronDown, ChevronUp, Trash2, MessageSquare,
  Clock, Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { useOrderStore, type Order, type OrderStatus } from "@/stores/order-store";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({ meta: [{ title: "Orders — Lreturns" }] }),
  component: OrdersPage,
});

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; row: string; badge: string }> = {
  pending:    { label: "Pending",    dot: "bg-warning",     row: "",                  badge: "bg-warning/10 text-warning border-warning/20" },
  processing: { label: "Processing", dot: "bg-info",        row: "bg-blue-500/5",     badge: "bg-info/10 text-info border-info/20" },
  shipped:    { label: "Shipped",    dot: "bg-primary",     row: "bg-primary/5",      badge: "bg-primary/10 text-primary border-primary/20" },
  delivered:  { label: "Delivered",  dot: "bg-success",     row: "bg-success/5",      badge: "bg-success/10 text-success border-success/20" },
  cancelled:  { label: "Cancelled",  dot: "bg-destructive", row: "bg-destructive/5",  badge: "bg-destructive/10 text-destructive border-destructive/20" },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function OrdersPage() {
  const { orders, updateStatus, updateNote, deleteOrder } = useOrderStore();
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<OrderStatus | "all">("all");
  const [expandedId, setExpanded]   = useState<string | null>(null);
  const [noteId, setNoteId]         = useState<string | null>(null);
  const [noteDraft, setNoteDraft]   = useState("");

  // Counts for stat chips
  const counts = Object.fromEntries(
    ALL_STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])
  ) as Record<OrderStatus, number>;

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleStatus(id: string, status: OrderStatus) {
    updateStatus(id, status);
    toast.success(`Order ${id} marked as ${STATUS_CONFIG[status].label}.`);
  }

  function handleDelete(id: string) {
    deleteOrder(id);
    toast.message(`Order ${id} deleted.`);
    if (expandedId === id) setExpanded(null);
  }

  function openNote(o: Order) {
    setNoteId(o.id);
    setNoteDraft(o.adminNote);
  }

  function saveNote(id: string) {
    updateNote(id, noteDraft);
    setNoteId(null);
    toast.success("Note saved.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Orders"
        subtitle="Review, process, and manage all customer orders."
      />

      {/* KPI stat chips */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setStatus("all")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${statusFilter === "all" ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-accent"}`}>
          <ShoppingBag className="h-4 w-4" />
          <span>All</span>
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{orders.length}</span>
        </button>
        {ALL_STATUSES.map((s) => {
          const c = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${statusFilter === s ? `border-primary bg-primary/10 text-primary` : "bg-card hover:bg-accent"}`}>
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              {c.label}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by order ID, name or email…"
          value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-24 text-center shadow-sm">
          <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">
            {orders.length === 0 ? "No orders yet. They'll appear here when customers check out." : "No orders match your filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr_auto] gap-4 border-b bg-muted/40 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const isNotingThis = noteId === order.id;
            const cfg = STATUS_CONFIG[order.status];

            return (
              <div key={order.id} className={`border-t transition-colors ${cfg.row}`}>
                {/* Main row */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr_auto] items-center gap-4 px-5 py-3">
                  {/* Order ID + date */}
                  <div>
                    <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="font-mono text-xs font-bold text-primary hover:underline">
                      {order.id}
                    </button>
                    <div className="text-xs text-muted-foreground">{format(new Date(order.placedAt), "MMM d, yyyy · h:mm a")}</div>
                  </div>

                  {/* Customer */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {order.customerName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Item count */}
                  <div className="text-sm text-muted-foreground">
                    {order.items.reduce((s, i) => s + i.qty, 0)} item{order.items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
                  </div>

                  {/* Total */}
                  <div className="text-sm font-bold">${order.total.toFixed(2)}</div>

                  {/* Status badge */}
                  <div><StatusBadge status={order.status} /></div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" title="Expand">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openNote(order)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" title="Add note">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(order.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr]">
                      {/* Items list */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items Ordered</p>
                        <ul className="space-y-1.5">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">{item.sku}</span>
                              </div>
                              <div className="text-right shrink-0 pl-4">
                                <span className="text-muted-foreground">×{item.qty}</span>
                                <span className="ml-2 font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 border-t pt-2 space-y-0.5 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Tax (10%)</span><span>${order.tax.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold text-sm text-foreground pt-1"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
                        </div>
                      </div>

                      {/* Delivery address */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery Address</p>
                        <div className="text-sm space-y-0.5">
                          <div className="font-medium">{order.address.fullName}</div>
                          <div className="text-muted-foreground">{order.address.line1}</div>
                          <div className="text-muted-foreground">{order.address.city}, {order.address.state} {order.address.postcode}</div>
                          <div className="text-muted-foreground">{order.address.country}</div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Placed {formatDistanceToNow(new Date(order.placedAt), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Status actions */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Update Status</p>
                        <div className="space-y-2">
                          {/* Approve / Reject quick actions */}
                          {order.status === "pending" && (
                            <div className="flex gap-2 mb-3">
                              <Button size="sm" className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                                onClick={() => handleStatus(order.id, "processing")}>
                                <Check className="mr-1 h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                                onClick={() => handleStatus(order.id, "cancelled")}>
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          )}
                          {/* All status options */}
                          <div className="grid grid-cols-2 gap-1.5">
                            {ALL_STATUSES.map((s) => {
                              const icons: Record<OrderStatus, React.ReactNode> = {
                                pending:    <Clock className="h-3 w-3" />,
                                processing: <Package2 className="h-3 w-3" />,
                                shipped:    <Truck className="h-3 w-3" />,
                                delivered:  <CheckCircle2 className="h-3 w-3" />,
                                cancelled:  <XCircle className="h-3 w-3" />,
                              };
                              return (
                                <button key={s} onClick={() => handleStatus(order.id, s)}
                                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition
                                    ${order.status === s
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"}`}>
                                  {icons[s]} {STATUS_CONFIG[s].label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Admin note */}
                        {isNotingThis ? (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Add an internal note…"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[70px] resize-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 flex-1" onClick={() => saveNote(order.id)}>Save Note</Button>
                              <Button size="sm" variant="ghost" className="h-7 flex-1" onClick={() => setNoteId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : order.adminNote ? (
                          <div className="mt-3 rounded-lg border border-dashed bg-muted/30 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Admin Note</p>
                            <p className="text-xs">{order.adminNote}</p>
                            <button onClick={() => openNote(order)} className="mt-1 text-[10px] text-primary hover:underline">Edit</button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}