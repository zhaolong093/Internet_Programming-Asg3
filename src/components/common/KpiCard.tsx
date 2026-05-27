import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  subtitle?: string;
  trend?: { value: string; up?: boolean };
  accent?: "primary" | "warning" | "success" | "info";
  icon?: LucideIcon;
  loading?: boolean;
  extra?: React.ReactNode;
}

const accentMap = {
  primary: "before:bg-primary",
  warning: "before:bg-warning",
  success: "before:bg-success",
  info: "before:bg-info",
};

export function KpiCard({
  label,
  value,
  subtitle,
  trend,
  accent = "primary",
  icon: Icon,
  loading,
  extra,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1",
        accentMap[accent],
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-32 lr-skeleton" />
      ) : (
        <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
      )}
      {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
      {trend ? (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            trend.up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend.value}
        </div>
      ) : null}
      {extra}
    </div>
  );
}
