import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[60%] w-[60%]">
        <path
          d="M20 12a8 8 0 1 1-2.34-5.66"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M20 4v4h-4"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  size = "md",
  invert = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  invert?: boolean;
  className?: string;
}) {
  const dims =
    size === "sm" ? "h-7 w-7 text-base" : size === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={dims} />
      <span
        className={cn(
          "font-display font-semibold tracking-tight",
          text,
          invert ? "text-white" : "text-foreground",
        )}
      >
        Lreturns
      </span>
    </div>
  );
}
