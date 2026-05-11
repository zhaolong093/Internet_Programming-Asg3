import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, DollarSign, Plus, RotateCcw, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { KpiCard } from "@/components/common/KpiCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, ReasonBadge } from "@/components/common/StatusBadge";
import { Avatar } from "@/components/common/Avatar";
import { SkeletonRow } from "@/components/common/SkeletonRow";
import { DonutChart } from "@/components/charts/Charts";
import { activity, reasonsBreakdown, returns } from "@/lib/mock/data";
import type { ReturnStatus } from "@/lib/mock/types";
import { toast } from "sonner";
import { useOrderStore } from "@/stores/order-store";
import { ShoppingBag } from "lucide-react";


export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lreturns" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  const recent = returns
    .filter(
      (r) =>
        (statusFilter === "all" || r.status === statusFilter) &&
        (!search ||
          r.id.toLowerCase().includes(search.toLowerCase()) ||
          r.customer.name.toLowerCase().includes(search.toLowerCase())),
    )
    .slice(0, 8);

  const pending = returns.filter((r) => r.status === "pending").slice(0, 5);
  const orders = useOrderStore((s) => s.orders);
  const colors = ["var(--primary)", "var(--info)", "var(--success)", "var(--warning)", "var(--destructive)"];
  

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={format(new Date(), "EEEE, d MMMM yyyy")} />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Returns" value="1,284" subtitle="This month" trend={{ value: "+12% vs last month", up: true }} accent="primary" icon={RotateCcw} loading={loading} />
        <KpiCard label="Pending Review" value="47" subtitle="Awaiting action" accent="warning" icon={Clock} loading={loading} extra={<div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 bg-warning" /></div>} />
        <KpiCard label="Approved" value="892" subtitle="Processed successfully" trend={{ value: "+5.4%", up: true }} accent="success" icon={CheckCircle2} loading={loading} />
        <KpiCard label="Revenue Recovered" value="$48,392" subtitle="From restocked items" trend={{ value: "+8.3%", up: true }} accent="info" icon={DollarSign} loading={loading} />
      </div>

      {/* Charts + quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Returns by Reason</h3>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[200px_1fr]">
              <DonutChart data={reasonsBreakdown.map((r) => ({ label: r.label, value: r.value }))} />
              <ul className="space-y-2 text-sm">
                {reasonsBreakdown.map((r, i) => {
                  const total = reasonsBreakdown.reduce((s, x) => s + x.value, 0);
                  const pct = Math.round((r.value / total) * 100);
                  return (
                    <li key={r.label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />
                        {r.label}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{r.value} <span className="text-xs">· {pct}%</span></span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Recent returns table */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Recent Returns</h3>
                <p className="text-xs text-muted-foreground">Latest customer return requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Search ID or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-44" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Link to="/returns" className="text-sm font-medium text-primary hover:underline">View All</Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="sticky top-0 px-4 py-2 text-left">Return ID</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Reason</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                    : recent.map((r) => (
                        <tr key={r.id} className="border-t transition hover:bg-accent/30">
                          <td className="px-4 py-3"><Link to="/returns/$id" params={{ id: r.id }} className="font-mono text-xs font-medium text-primary hover:underline">{r.id}</Link></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar size="sm" name={r.customer.name} /><span className="truncate">{r.customer.name}</span></div></td>
                          <td className="px-4 py-3"><div className="line-clamp-1 max-w-[220px]">{r.product.name}</div></td>
                          <td className="px-4 py-3"><ReasonBadge reason={r.reason} /></td>
                          <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.submittedAt), "MMM d")}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-right"><Link to="/returns/$id" params={{ id: r.id }}><Button variant="ghost" size="sm">Review</Button></Link></td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <Button className="w-full" onClick={() => toast.success("Manual return draft created (mock).")}>
            <Plus className="mr-1 h-4 w-4" /> Create Manual Return
          </Button>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Pending Approvals</h3>
            <p className="text-xs text-muted-foreground">Top items needing your action</p>
            <ul className="mt-3 max-h-72 space-y-3 overflow-auto pr-1">
              {pending.map((p) => (
                <li key={p.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-primary">{p.id}</div>
                      <div className="truncate font-medium">{p.customer.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{p.product.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => toast.success(`${p.id} approved`)}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 flex-1" onClick={() => toast.message(`${p.id} rejected`)}>Reject</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Recent Activity</h3>
            <ul className="mt-3 space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="relative pl-5 text-sm">
                  <span className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${a.type === "approved" ? "bg-success" : a.type === "rejected" ? "bg-destructive" : a.type === "refunded" ? "bg-primary" : a.type === "submitted" ? "bg-info" : "bg-muted-foreground"}`} />
                  <div>{a.message}</div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.ts), { addSuffix: true })}</div>
                </li>
              ))}
            </ul>
          </div>
          {/* Recent Orders from customers */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Customer Orders</h3>
                <p className="text-xs text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
              </div>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>
            {orders.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="max-h-72 space-y-3 overflow-auto pr-1">
                {orders.slice(0, 8).map((o) => (
                  <li key={o.id} className="rounded-lg border p-3 text-sm space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-[11px] text-primary font-bold">{o.id}</div>
                        <div className="font-medium">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold">${o.total.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)} item{o.items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.address.city}, {o.address.state} · {formatDistanceToNow(new Date(o.placedAt), { addSuffix: true })}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {o.items.map((i) => (
                        <span key={i.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{i.name} ×{i.qty}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
      <X className="hidden" />
    </div>
  );
}