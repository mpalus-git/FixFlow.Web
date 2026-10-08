import { type LucideIcon, PackageXIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { statusCountOf } from "@/features/dashboard/api/dashboardQueries";
import type { components } from "@/shared/api/schema";
import { Skeleton } from "@/shared/ui/skeleton";

type DashboardSummaryResponse = components["schemas"]["DashboardSummaryResponse"];

const queueStripClassName =
  "grid divide-y overflow-hidden rounded-xl border bg-card lg:grid-cols-5 lg:divide-x lg:divide-y-0";
const queueItemClassName =
  "flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-start lg:justify-start lg:gap-1";

type StatTileProps = {
  label: string;
  value: number;
  to: string;
  attentionIcon?: LucideIcon;
};

function StatTile({ label, value, to, attentionIcon: AttentionIcon }: StatTileProps) {
  return (
    <li>
      <Link
        to={to}
        className={`${queueItemClassName} h-full transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset`}
      >
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {AttentionIcon !== undefined && value > 0 ? (
            <AttentionIcon aria-hidden="true" className="size-4 text-warning-strong" />
          ) : null}
          {label}
        </span>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
      </Link>
    </li>
  );
}

export function DashboardStatTilesSkeleton() {
  return (
    <div aria-hidden="true" className={queueStripClassName}>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className={queueItemClassName}>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-10" />
        </div>
      ))}
    </div>
  );
}

export type DashboardStatTilesProps = {
  summary: DashboardSummaryResponse;
};

export function DashboardStatTiles({ summary }: DashboardStatTilesProps) {
  const { t } = useTranslation();

  return (
    <ul aria-label={t("dashboard.tiles.label")} className={queueStripClassName}>
      <StatTile
        label={t("dashboard.tiles.unassigned")}
        value={statusCountOf(summary, "New")}
        to="/work-orders?status=New"
      />
      <StatTile
        label={t("dashboard.tiles.inProgress")}
        value={statusCountOf(summary, "InProgress")}
        to="/work-orders?status=InProgress"
      />
      <StatTile
        label={t("dashboard.tiles.toInvoice")}
        value={statusCountOf(summary, "Completed")}
        to="/work-orders?status=Completed"
      />
      <StatTile
        label={t("dashboard.tiles.overdue")}
        value={summary.overdueCount}
        to="/work-orders?overdue=true"
        attentionIcon={TriangleAlertIcon}
      />
      <StatTile
        label={t("dashboard.tiles.outOfStock")}
        value={summary.outOfStockPartCount}
        to="/parts?stock=out"
        attentionIcon={PackageXIcon}
      />
    </ul>
  );
}
