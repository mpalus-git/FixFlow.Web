import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/features/dashboard/components/ChartTooltip";
import type { components } from "@/shared/api/schema";

type TechnicianWorkloadResponse = components["schemas"]["TechnicianWorkloadResponse"];

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };
const rowHeight = 44;

type LegendItemProps = {
  color: string;
  label: string;
};

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </li>
  );
}

export type TechnicianWorkloadChartProps = {
  technicians: TechnicianWorkloadResponse[];
};

export function TechnicianWorkloadChart({ technicians }: TechnicianWorkloadChartProps) {
  const { t } = useTranslation();
  const data = technicians.map((technician) => ({
    name: technician.fullName,
    assigned: technician.assignedCount,
    inProgress: technician.inProgressCount,
    total: technician.assignedCount + technician.inProgressCount,
  }));

  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <LegendItem color="var(--chart-1)" label={t("dashboard.workload.assigned")} />
        <LegendItem color="var(--chart-2)" label={t("dashboard.workload.inProgress")} />
      </ul>
      <BarChart
        responsive
        layout="vertical"
        data={data}
        accessibilityLayer={false}
        style={{ width: "100%", height: data.length * rowHeight + 32 }}
        margin={{ top: 4, right: 32, bottom: 4, left: 4 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={ChartTooltip} />
        <Bar
          dataKey="assigned"
          name={t("dashboard.workload.assigned")}
          stackId="open"
          fill="var(--chart-1)"
          stroke="var(--card)"
          strokeWidth={2}
          barSize={22}
        />
        <Bar
          dataKey="inProgress"
          name={t("dashboard.workload.inProgress")}
          stackId="open"
          fill="var(--chart-2)"
          stroke="var(--card)"
          strokeWidth={2}
          barSize={22}
          radius={[0, 4, 4, 0]}
        >
          <LabelList dataKey="total" position="right" fill="var(--foreground)" fontSize={12} />
        </Bar>
      </BarChart>
    </div>
  );
}
