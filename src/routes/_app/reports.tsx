import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { BarChart, Sparkline, StackedBar } from "@/components/charts/Charts";
import { monthlyVolume, monthlyRefunds, reasonsBreakdown } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReturnStore } from "@/stores/return-store";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Lreturns" }] }),
  component: ReportsPage,
});

const PRESETS = ["Last 7 days", "Last 30 days", "Last Quarter", "Custom"] as const;

function ReportsPage() {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>("Last 30 days");
  const allReturns = useReturnStore((s) => s.returns);
  const totalReturns = allReturns.length;
  const totalApproved = allReturns.filter(
    (r) => r.status === "approved" || r.status === "refunded",
  ).length;
  const totalRejected = allReturns.filter((r) => r.status === "rejected").length;
  const totalRefundValue = allReturns
    .filter((r) => r.status === "refunded")
    .reduce((s, r) => s + r.refundAmount, 0);
  const approvalRate = totalReturns > 0 ? Math.round((totalApproved / totalReturns) * 100) : 0;

  function downloadCsv() {
    const rows = [
      ["Month", "Total", "Approved", "Rejected", "Avg Days", "Refund Total", "Recovery %"],
    ];
    monthlyVolume.forEach((m, i) => {
      const approved = Math.round(m.v * 0.72);
      const rejected = m.v - approved;
      rows.push([
        m.m,
        String(m.v),
        String(approved),
        String(rejected),
        (1.8 + i * 0.05).toFixed(1),
        `$${monthlyRefunds[i].v}`,
        `${Math.round(50 + Math.random() * 30)}%`,
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "lreturns-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  preset === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold">Returns Volume Trend</h3>
          <p className="text-xs text-muted-foreground">Total returns per month</p>
          <div className="mt-4">
            <BarChart data={monthlyVolume.map((m) => ({ label: m.m, value: m.v }))} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold">Refund Amount Trend</h3>
          <p className="text-xs text-muted-foreground">Refund dollars issued per month</p>
          <div className="mt-4">
            <BarChart
              data={monthlyRefunds.map((m) => ({ label: m.m, value: m.v }))}
              valueFormat={(n) => `$${n}`}
              color="var(--success)"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold">Returns by Reason</h3>
          <div className="mt-4">
            <BarChart
              data={reasonsBreakdown.map((r) => ({ label: r.label.split(" ")[0], value: r.value }))}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold">Returns by Category</h3>
          <div className="mt-4">
            <StackedBar
              segments={[
                { label: "Apparel", value: 420, color: "var(--primary)" },
                { label: "Electronics", value: 280, color: "var(--info)" },
                { label: "Home", value: 190, color: "var(--success)" },
                { label: "Accessories", value: 120, color: "var(--warning)" },
              ]}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold">Processing Time</h3>
          <div className="mt-4 font-display text-3xl font-semibold">2.4 days</div>
          <p className="text-xs text-muted-foreground">Avg. to resolution</p>
          <Sparkline data={[3.1, 2.9, 2.7, 2.6, 2.4, 2.5, 2.4]} className="mt-3" width={180} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-display text-base font-semibold">Detailed Breakdown</h3>
            <p className="text-xs text-muted-foreground">Monthly summary</p>
          </div>
          <Button variant="outline" onClick={downloadCsv}>
            <Download className="mr-1 h-4 w-4" />
            Download Report
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Month</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Approved</th>
                <th className="px-4 py-2 text-right">Rejected</th>
                <th className="px-4 py-2 text-right">Avg Days</th>
                <th className="px-4 py-2 text-right">Refund Total</th>
                <th className="px-4 py-2 text-right">Recovery %</th>
              </tr>
            </thead>
            <tbody>
              {monthlyVolume.map((m, i) => {
                const approved = Math.round(m.v * (approvalRate / 100));
                const rejected = m.v - approved;
                return (
                  <tr key={m.m} className="border-t hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{m.m}</td>
                    <td className="px-4 py-3 tabular-nums text-right">{m.v}</td>
                    <td className="px-4 py-3 tabular-nums text-right text-success">{approved}</td>
                    <td className="px-4 py-3 tabular-nums text-right text-destructive">
                      {rejected}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-right">
                      {(1.8 + i * 0.05).toFixed(1)} days
                    </td>
                    <td className="px-4 py-3 tabular-nums text-right">
                      ${monthlyRefunds[i].v.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-right">{approvalRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
