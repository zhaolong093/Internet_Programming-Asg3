import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, ReasonBadge } from "@/components/common/StatusBadge";
import { Avatar } from "@/components/common/Avatar";
import { SkeletonRow } from "@/components/common/SkeletonRow";
import { returns as allReturns } from "@/lib/mock/data";
import type { ReturnStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/returns")({
  head: () => ({ meta: [{ title: "Returns — Lreturns" }] }),
  component: ReturnsList,
});

const STATUSES: ReturnStatus[] = ["pending", "approved", "rejected", "processing", "refunded"];

function ReturnsList() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<ReturnStatus>>(new Set());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "status" | "customer">("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  const filtered = allReturns
    .filter((r) => (active.size === 0 || active.has(r.status)))
    .filter((r) => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.customer.name.toLowerCase().includes(search.toLowerCase()) || r.product.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !from || new Date(r.submittedAt) >= new Date(from))
    .filter((r) => !to || new Date(r.submittedAt) <= new Date(to))
    .sort((a, b) => {
      if (sort === "newest") return +new Date(b.submittedAt) - +new Date(a.submittedAt);
      if (sort === "oldest") return +new Date(a.submittedAt) - +new Date(b.submittedAt);
      if (sort === "status") return a.status.localeCompare(b.status);
      return a.customer.name.localeCompare(b.customer.name);
    });

  const start = (page - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const filtersActive = active.size > 0 || !!search || !!from || !!to;

  function toggleStatus(s: ReturnStatus) {
    const next = new Set(active);
    next.has(s) ? next.delete(s) : next.add(s);
    setActive(next);
    setPage(1);
  }
  function toggleAll() {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map((v) => v.id)));
  }
  function toggleOne(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns Management"
        subtitle="Review, approve, or reject customer return requests."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("CSV exported (mock)")}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => toast.success("Manual return draft created (mock)")}>
              <Plus className="mr-1 h-4 w-4" /> Create Return
            </Button>
          </>
        }
      />

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Search by Return ID, customer, or product…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-9 w-72 max-w-full" />
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                  active.has(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36" />
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 rounded-md border bg-background px-2 text-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="status">Status</option>
            <option value="customer">Customer A–Z</option>
          </select>
          {filtersActive && (
            <button className="ml-auto text-xs font-medium text-primary hover:underline" onClick={() => { setActive(new Set()); setSearch(""); setFrom(""); setTo(""); }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2"><Checkbox checked={visible.length > 0 && selected.size === visible.length} onCheckedChange={toggleAll} /></th>
                <th className="px-4 py-2 text-left">Return ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-right">Refund</th>
                <th className="px-4 py-2 text-left">Submitted</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
                : visible.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-accent/30">
                      <td className="px-4 py-3"><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} /></td>
                      <td className="px-4 py-3"><Link to="/returns/$id" params={{ id: r.id }} className="font-mono text-xs font-medium text-primary hover:underline">{r.id}</Link></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm" name={r.customer.name} />
                          <div className="min-w-0">
                            <div className="truncate">{r.customer.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{r.customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="line-clamp-1 max-w-[220px]">{r.product.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{r.product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.qty}</td>
                      <td className="px-4 py-3"><ReasonBadge reason={r.reason} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">${r.refundAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.submittedAt), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3 text-sm text-muted-foreground">
          <div>Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + perPage, filtered.length)} of {filtered.length} returns</div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
              <Button key={i} size="sm" variant={page === i + 1 ? "default" : "ghost"} onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-lg lr-fade-up lg:bottom-6">
          <span className="text-sm">{selected.size} selected</span>
          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => { toast.success(`${selected.size} approved`); setSelected(new Set()); }}>Approve all</Button>
          <Button size="sm" variant="outline" onClick={() => { toast.message(`${selected.size} rejected`); setSelected(new Set()); }}>Reject all</Button>
          <Button size="sm" variant="ghost" onClick={() => toast.success("Selected exported")}>Export</Button>
        </div>
      )}
    </div>
  );
}