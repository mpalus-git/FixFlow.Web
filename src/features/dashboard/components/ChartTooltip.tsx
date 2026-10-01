import type { TooltipContentProps } from "recharts";

export function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || payload.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <span className="text-muted-foreground">{label}</span>
      {payload.map((entry) => (
        <span key={String(entry.dataKey)} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-0.5 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-semibold tabular-nums">{String(entry.value)}</span>
          <span className="text-muted-foreground">{entry.name}</span>
        </span>
      ))}
    </div>
  );
}
