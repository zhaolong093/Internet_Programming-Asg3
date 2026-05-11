import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";
import { notifications as seed } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  new: { icon: Bell, color: "bg-info text-info-foreground" },
  approved: { icon: CheckCircle2, color: "bg-success text-success-foreground" },
  flagged: { icon: AlertTriangle, color: "bg-warning text-warning-foreground" },
  system: { icon: Info, color: "bg-muted text-foreground" },
} as const;

export function NotificationPanel() {
  const open = useUIStore((s) => s.notifOpen);
  const setOpen = useUIStore((s) => s.setNotifOpen);
  const [items, setItems] = useState(seed);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[320px] p-0 sm:max-w-[320px]">
        <SheetHeader className="flex-row items-center justify-between border-b p-4">
          <SheetTitle>Notifications</SheetTitle>
          <button
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setItems((s) => s.map((i) => ({ ...i, read: true })))}
          >
            Mark all read
          </button>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No new notifications</div>
          ) : (
            <ul>
              {items.map((n) => {
                const m = iconMap[n.type];
                const Icon = m.icon;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 border-b p-4 text-sm",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", m.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground">{n.message}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.ts), { addSuffix: true })}
                      </div>
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}