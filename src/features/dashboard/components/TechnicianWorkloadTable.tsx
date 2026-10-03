import { TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
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

type TechnicianWorkloadResponse = components["schemas"]["TechnicianWorkloadResponse"];

const numericCell = "px-3 text-right tabular-nums";
const technicianCell = "sticky left-0 z-10 bg-card px-3";

export type TechnicianWorkloadTableProps = {
  technicians: TechnicianWorkloadResponse[];
};

export function TechnicianWorkloadTable({ technicians }: TechnicianWorkloadTableProps) {
  const { t } = useTranslation();

  return (
    <Table label={t("dashboard.technicians.title")}>
      <TableCaption className="sr-only">{t("dashboard.technicians.title")}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={technicianCell}>{t("dashboard.workload.technician")}</TableHead>
          <TableHead className={numericCell}>{t("dashboard.workload.assigned")}</TableHead>
          <TableHead className={numericCell}>{t("dashboard.workload.inProgress")}</TableHead>
          <TableHead className={numericCell}>{t("dashboard.workload.overdue")}</TableHead>
          <TableHead className={numericCell}>{t("dashboard.workload.dueThisWeek")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {technicians.map((technician) => (
          <TableRow key={technician.technicianId}>
            <TableHead
              scope="row"
              className={`${technicianCell} min-w-36 font-normal whitespace-normal`}
            >
              <Link
                to={`/work-orders?technician=${technician.technicianId}`}
                className="font-medium [overflow-wrap:anywhere] underline-offset-4 hover:underline"
              >
                {technician.fullName}
              </Link>
            </TableHead>
            <TableCell className={numericCell}>{technician.assignedCount}</TableCell>
            <TableCell className={numericCell}>{technician.inProgressCount}</TableCell>
            <TableCell className={numericCell}>
              <span className="inline-flex items-center gap-1">
                {technician.overdueCount > 0 ? (
                  <TriangleAlertIcon
                    aria-hidden="true"
                    className="size-3.5 text-amber-600 dark:text-amber-400"
                  />
                ) : null}
                {technician.overdueCount}
              </span>
            </TableCell>
            <TableCell className={numericCell}>{technician.dueThisWeekCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
