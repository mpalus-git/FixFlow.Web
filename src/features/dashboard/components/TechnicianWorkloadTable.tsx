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

type SeriesHeadProps = {
  color: string;
  label: string;
};

function SeriesHead({ color, label }: SeriesHeadProps) {
  return (
    <TableHead className={numericCell}>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
    </TableHead>
  );
}

type WorkloadBarProps = {
  assignedCount: number;
  inProgressCount: number;
  maxOpenCount: number;
};

function WorkloadBar({ assignedCount, inProgressCount, maxOpenCount }: WorkloadBarProps) {
  const share = (count: number) => `${String((count / maxOpenCount) * 100)}%`;

  return (
    <span aria-hidden="true" className="mt-1.5 flex h-1.5 w-full gap-0.5">
      {assignedCount > 0 ? (
        <span
          className="rounded-full"
          style={{ width: share(assignedCount), backgroundColor: "var(--chart-1)" }}
        />
      ) : null}
      {inProgressCount > 0 ? (
        <span
          className="rounded-full"
          style={{ width: share(inProgressCount), backgroundColor: "var(--chart-2)" }}
        />
      ) : null}
    </span>
  );
}

export type TechnicianWorkloadTableProps = {
  technicians: TechnicianWorkloadResponse[];
};

export function TechnicianWorkloadTable({ technicians }: TechnicianWorkloadTableProps) {
  const { t } = useTranslation();
  const maxOpenCount = Math.max(
    1,
    ...technicians.map(({ assignedCount, inProgressCount }) => assignedCount + inProgressCount),
  );

  return (
    <Table label={t("dashboard.technicians.title")}>
      <TableCaption className="sr-only">{t("dashboard.technicians.title")}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={technicianCell}>{t("dashboard.workload.technician")}</TableHead>
          <SeriesHead color="var(--chart-1)" label={t("dashboard.workload.assigned")} />
          <SeriesHead color="var(--chart-2)" label={t("dashboard.workload.inProgress")} />
          <TableHead className={numericCell}>{t("dashboard.workload.overdue")}</TableHead>
          <TableHead className={numericCell}>{t("dashboard.workload.dueThisWeek")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {technicians.map((technician) => (
          <TableRow key={technician.technicianId}>
            <TableHead
              scope="row"
              className={`${technicianCell} w-full min-w-36 font-normal whitespace-normal`}
            >
              <Link
                to={`/work-orders?technician=${technician.technicianId}`}
                className="font-medium [overflow-wrap:anywhere] underline-offset-4 hover:underline"
              >
                {technician.fullName}
              </Link>
              <WorkloadBar
                assignedCount={technician.assignedCount}
                inProgressCount={technician.inProgressCount}
                maxOpenCount={maxOpenCount}
              />
            </TableHead>
            <TableCell className={numericCell}>{technician.assignedCount}</TableCell>
            <TableCell className={numericCell}>{technician.inProgressCount}</TableCell>
            <TableCell className={numericCell}>
              <span className="inline-flex items-center gap-1">
                {technician.overdueCount > 0 ? (
                  <TriangleAlertIcon aria-hidden="true" className="size-3.5 text-warning-strong" />
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
