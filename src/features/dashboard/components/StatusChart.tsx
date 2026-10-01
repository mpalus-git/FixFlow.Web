import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/features/dashboard/components/ChartTooltip";
import type { components } from "@/shared/api/schema";

type WorkOrderStatusCountResponse = components["schemas"]["WorkOrderStatusCountResponse"];

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

export type StatusChartProps = {
  statusCounts: WorkOrderStatusCountResponse[];
};

export function StatusChart({ statusCounts }: StatusChartProps) {
  const { t } = useTranslation();
  const data = statusCounts.map(({ status, count }) => ({
    status,
    label: t(`workOrders.status.${status}`),
    count,
  }));

  return (
    <>
      <BarChart
        responsive
        layout="vertical"
        data={data}
        style={{ width: "100%", height: 240 }}
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
          dataKey="label"
          width={104}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={ChartTooltip} />
        <Bar
          dataKey="count"
          name={t("dashboard.statusChart.series")}
          fill="var(--chart-1)"
          barSize={20}
          radius={[0, 4, 4, 0]}
        >
          <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={12} />
        </Bar>
      </BarChart>
      <table className="sr-only">
        <caption>{t("dashboard.statusChart.title")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("dashboard.statusChart.status")}</th>
            <th scope="col">{t("dashboard.statusChart.series")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ status, label, count }) => (
            <tr key={status}>
              <th scope="row">{label}</th>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
