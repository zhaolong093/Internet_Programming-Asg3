import { cn } from "@/lib/utils";

const palette = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-teal-500",
];

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  const dims =
    size === "sm"
      ? "h-7 w-7 text-[11px]"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-9 w-9 text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        colorFor(name),
        dims,
        className,
      )}
    >
      {initials}
    </span>
  );
}
