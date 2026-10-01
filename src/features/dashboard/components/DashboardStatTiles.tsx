import { cn } from "cn";
import {
  ClipboardPlusIcon,
  type LucideIcon,
  ReceiptTextIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { statusCountOf } from "@/features/dashboard/api/dashboardQueries";
import type { components } from "@/shared/api/schema";

type DashboardSummaryResponse = components["schemas"]["DashboardSummaryResponse"];

type StatTileProps = {
  label: string;
  description: string;
  value: number;
  to: string;
  icon: LucideIcon;
  iconClassName?: string;
};

function StatTile({ label, description, value, to, icon: Icon, iconClassName }: StatTileProps) {
  return (
    <li>
      <Link
        to={to}
        className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="flex items-center justify-between gap-2 text-sm font-medium">
          {label}
          <Icon aria-hidden="true" className={cn("size-4 text-muted-foreground", iconClassName)} />
        </span>
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Link>
    </li>
  );
}

export type DashboardStatTilesProps = {
  summary: DashboardSummaryResponse;
};

export function DashboardStatTiles({ summary }: DashboardStatTilesProps) {
  const { t } = useTranslation();

  return (
    <ul aria-label={t("dashboard.tiles.label")} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatTile
        label={t("dashboard.tiles.unassigned")}
        description={t("dashboard.tiles.unassignedHint")}
        value={statusCountOf(summary, "New")}
        to="/work-orders?status=New"
        icon={ClipboardPlusIcon}
      />
      <StatTile
        label={t("dashboard.tiles.inProgress")}
        description={t("dashboard.tiles.inProgressHint")}
        value={statusCountOf(summary, "InProgress")}
        to="/work-orders?status=InProgress"
        icon={WrenchIcon}
      />
      <StatTile
        label={t("dashboard.tiles.toInvoice")}
        description={t("dashboard.tiles.toInvoiceHint")}
        value={statusCountOf(summary, "Completed")}
        to="/work-orders?status=Completed"
        icon={ReceiptTextIcon}
      />
      <StatTile
        label={t("dashboard.tiles.overdue")}
        description={t("dashboard.tiles.overdueHint")}
        value={summary.overdueCount}
        to="/work-orders?overdue=true"
        icon={TriangleAlertIcon}
        {...(summary.overdueCount > 0
          ? { iconClassName: "text-amber-600 dark:text-amber-400" }
          : {})}
      />
    </ul>
  );
}
