import { useTranslation } from "react-i18next";
import type { components } from "@/shared/api/schema";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type WorkOrderStatusCountResponse = components["schemas"]["WorkOrderStatusCountResponse"];

export type StatusChartProps = {
  statusCounts: WorkOrderStatusCountResponse[];
};

export function StatusChart({ statusCounts }: StatusChartProps) {
  const { t } = useTranslation();
  const maxCount = Math.max(1, ...statusCounts.map(({ count }) => count));

  return (
    <Table label={t("dashboard.statusChart.title")}>
      <TableCaption className="sr-only">{t("dashboard.statusChart.title")}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0 px-3">{t("dashboard.statusChart.status")}</TableHead>
          <TableHead className="px-3">{t("dashboard.statusChart.series")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statusCounts.map(({ status, count }) => (
          <TableRow key={status}>
            <TableHead scope="row" className="px-3 font-normal">
              {t(`workOrders.status.${status}`)}
            </TableHead>
            <TableCell className="px-3">
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-3 flex-1">
                  {count > 0 ? (
                    <span
                      className="rounded-r-sm"
                      style={{
                        width: `${String((count / maxCount) * 100)}%`,
                        backgroundColor: "var(--chart-1)",
                      }}
                    />
                  ) : null}
                </span>
                <span className="w-8 text-right font-medium tabular-nums">{count}</span>
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
