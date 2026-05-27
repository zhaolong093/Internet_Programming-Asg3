import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function DonutChart({
  data,
  size = 180,
  thickness = 22,
}: {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const colors = [
    "var(--primary)",
    "var(--info)",
    "var(--success)",
    "var(--warning)",
    "var(--destructive)",
  ];
  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--muted)"
          strokeWidth={thickness}
          fill="none"
        />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const dasharray = `${len} ${c - len}`;
          const el = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={d.color ?? colors[i % colors.length]}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={dasharray}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-display text-xl font-semibold"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {total.toLocaleString()}
        </text>
      </svg>
    </div>
  );
}

export function BarChart({
  data,
  height = 180,
  valueFormat = (n: number) => n.toString(),
  color = "var(--primary)",
  orientation = "vertical",
}: {
  data: { label: string; value: number }[];
  height?: number;
  valueFormat?: (n: number) => string;
  color?: string;
  orientation?: "vertical" | "horizontal";
}) {
  const max = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  if (orientation === "horizontal") {
    return (
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3 text-sm">
            <div className="w-28 truncate text-muted-foreground">{d.label}</div>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(d.value / max) * 100}%`, background: color }}
              />
            </div>
            <div className="w-16 text-right tabular-nums">{valueFormat(d.value)}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => {
        const h = Math.max(2, (d.value / max) * (height - 24));
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all group-hover:opacity-80"
                style={{ height: h, background: color }}
                title={`${d.label}: ${valueFormat(d.value)}`}
              />
              <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[10px] text-background group-hover:block">
                {valueFormat(d.value)}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "var(--primary)",
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data
    .map((v, i) => `${i * stepX},${height - ((v - min) / span) * (height - 4) - 2}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn(className)}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={pts}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StackedBar({
  segments,
  height = 14,
}: {
  segments: { label: string; value: number; color: string }[];
  height?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex w-full overflow-hidden rounded-full bg-muted" style={{ height }}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            {s.label}{" "}
            <span className="text-foreground">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
