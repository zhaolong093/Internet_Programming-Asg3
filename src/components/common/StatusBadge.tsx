import { cn } from "@/lib/utils";
import type { ReturnStatus } from "@/lib/mock/types";

const map: Record<ReturnStatus, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-warning/15 text-warning-foreground ring-warning/30" },
  approved:   { label: "Approved",   cls: "bg-success/15 text-success ring-success/30" },
  rejected:   { label: "Rejected",   cls: "bg-destructive/15 text-destructive ring-destructive/30" },
  processing: { label: "Processing", cls: "bg-info/15 text-info ring-info/30" },
  refunded:   { label: "Refunded",   cls: "bg-primary/10 text-primary ring-primary/30" },
};

export function StatusBadge({ status, large }: { status: ReturnStatus; large?: boolean }) {
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset font-medium capitalize",
        large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
        m.cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  );
}

const reasonColors: Record<string, string> = {
  "Wrong Item":    "bg-info/15 text-info",
  "Damaged":       "bg-destructive/15 text-destructive",
  "Changed Mind":  "bg-muted text-muted-foreground",
  "Quality Issue": "bg-warning/15 text-warning-foreground",
  "Other":         "bg-secondary text-secondary-foreground",
};

export function ReasonBadge({ reason }: { reason: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        reasonColors[reason] ?? "bg-muted text-muted-foreground",
      )}
    >
      {reason}
    </span>
  );
}