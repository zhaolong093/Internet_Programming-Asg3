import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, DollarSign, Plus, RotateCcw, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { KpiCard } from "@/components/common/KpiCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, ReasonBadge } from "@/components/common/StatusBadge";
import { Avatar } from "@/components/common/Avatar";
import { SkeletonRow } from "@/components/common/SkeletonRow";
import { DonutChart } from "@/components/charts/Charts";
import { activity, reasonsBreakdown } from "@/lib/mock/data";
import { useReturnStore } from "@/stores/return-store";
import { useOrderStore } from "@/stores/order-store";
import { useUserStore } from "@/stores/user-store";
import type { ReturnStatus } from "@/lib/mock/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lreturns" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const allReturns = useReturnStore((s) => s.returns);
  const updateStatus = useReturnStore((s) => s.updateStatus);
  const orders = useOrderStore((s) => s.orders);
  const users = useUserStore((s) => s.users);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  // ── Real KPI calculations ──────────────────────────────────────────────────
  const totalReturns = allReturns.length;
  const pendingCount = allReturns.filter((r) => r.status === "pending").length;
  const approvedCount = allReturns.filter((r) => r.status === "approved" || r.status === "refunded").length;
  const revenueRecovered = allReturns
    .filter((r) => r.status === "refunded")
    .reduce((s, r) => s + r.refundAmount, 0);

  // ── Filtered recent returns ────────────────────────────────────────────────
  const recent = allReturns
    .filter(
      (r) =>
        (statusFilter === "all" || r.status === statusFilter) &&
        (!search ||
          r.id.toLowerCase().includes(search.toLowerCase()) ||
          r.customer.name.toLowerCase().includes(search.toLowerCase())),
    )
    .slice(0, 8);

  const pending = allReturns.filter((r) => r.status === "pending").slice(0, 5);
  const pendingOrders = orders.filter((o) => o.status === "pending").slice(0, 5);
  const colors = ["var(--primary)", "var(--info)", "var(--success)", "var(--warning)", "var(--destructive)"];

  function handleApprove(id: string) {
    updateStatus(id, "approved");
    toast.success(`${id} approved`);
  }

  function handleReject(id: string) {
    updateStatus(id, "rejected");
    toast.message(`${id} rejected`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={format(new Date(), "EEEE, d MMMM yyyy")} />

      {/* KPI row — live numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Returns" value={totalReturns.toLocaleString()} subtitle="All time" accent="primary" icon={RotateCcw} loading={loading} />
        <KpiCard label="Pending Review" value={pendingCount.toString()} subtitle="Awaiting action" accent="warning" icon={Clock} loading={loading}
          extra={<div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-warning transition-all" style={{ width: `${totalReturns > 0 ? (pendingCount / totalReturns) * 100 : 0}%` }} /></div>} />
        <KpiCard label="Approved" value={approvedCount.toLocaleString()} subtitle="Processed successfully" trend={{ value: `${totalReturns > 0 ? Math.round((approvedCount / totalReturns) * 100) : 0}% approval rate`, up: true }} accent="success" icon={CheckCircle2} loading={loading} />
        <KpiCard label="Revenue Recovered" value={`$${revenueRecovered.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtitle="From refunded returns" accent="info" icon={DollarSign} loading={loading} />
      </div>

      {/* Charts + table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Returns by Reason</h3>
                <p className="text-xs text-muted-foreground">All time breakdown</p>
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
                    <th className="px-4 py-2 text-left">Return ID</th>
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
                    : recent.length === 0
                    ? <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No returns match your filters.</td></tr>
                    : recent.map((r) => (
                        <tr key={r.id} className="border-t transition hover:bg-accent/30">
                          <td className="px-4 py-3"><Link to="/returns/$id" params={{ id: r.id }} className="font-mono text-xs font-medium text-primary hover:underline">{r.id}</Link></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar size="sm" name={r.customer.name} /><span className="truncate">{r.customer.name}</span></div></td>
                          <td className="px-4 py-3"><div className="line-clamp-1 max-w-[200px]">{r.product.name}</div></td>
                          <td className="px-4 py-3"><ReasonBadge reason={r.reason} /></td>
                          <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.submittedAt), "MMM d")}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-right">
                            <Link to="/returns/$id" params={{ id: r.id }}>
                              <Button variant="ghost" size="sm">Review</Button>
                            </Link>
                          </td>
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

          {/* Pending returns approvals — REAL actions */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Pending Returns</h3>
            <p className="text-xs text-muted-foreground">{pendingCount} return{pendingCount !== 1 ? "s" : ""} awaiting action</p>
            <ul className="mt-3 max-h-72 space-y-3 overflow-auto pr-1">
              {pending.length === 0 ? (
                <li className="py-4 text-center text-sm text-muted-foreground">All caught up! 🎉</li>
              ) : pending.map((p) => (
                <li key={p.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-primary">{p.id}</div>
                    <div className="truncate font-medium">{p.customer.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.product.name} · ${p.refundAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => handleApprove(p.id)}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 flex-1 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleReject(p.id)}>Reject</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pending orders — REAL actions */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-base font-semibold">Pending Orders</h3>
              <Link to="/orders" className="text-xs font-medium text-primary hover:underline">View All</Link>
            </div>
            <p className="text-xs text-muted-foreground">{pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""} to process</p>
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
              {pendingOrders.length === 0 ? (
                <li className="py-4 text-center text-sm text-muted-foreground">No pending orders.</li>
              ) : pendingOrders.map((o) => (
                <li key={o.id} className="rounded-lg border p-3 text-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-[11px] font-bold text-primary">{o.id}</div>
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)} items · ${o.total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 flex-1 bg-success text-success-foreground hover:bg-success/90"
                      onClick={() => { useOrderStore.getState().updateStatus(o.id, "processing"); toast.success(`${o.id} approved`); }}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => { useOrderStore.getState().updateStatus(o.id, "cancelled"); toast.message(`${o.id} rejected`); }}>
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity */}
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
        </aside>
      </div>
      <X className="hidden" />
    </div>
  );
}