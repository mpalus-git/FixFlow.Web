import { useQuery } from "@tanstack/react-query";
import { CalendarRangeIcon, ClipboardListIcon, RefreshCwIcon, UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { dashboardSummaryQueryOptions } from "@/features/dashboard/api/dashboardQueries";
import {
  DashboardStatTiles,
  DashboardStatTilesSkeleton,
} from "@/features/dashboard/components/DashboardStatTiles";
import { StatusChart } from "@/features/dashboard/components/StatusChart";
import { TechnicianWorkloadTable } from "@/features/dashboard/components/TechnicianWorkloadTable";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatCalendarDate, formatDateTime } from "@/shared/lib/dateTime";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/shared/ui/PageHeader";

function DashboardSkeleton() {
  const { t } = useTranslation();

  return (
    <div role="status" aria-label={t("states.loading")} className="flex flex-col gap-6">
      <DashboardStatTilesSkeleton />
      <div className="grid gap-6 xl:grid-cols-5">
        <Skeleton className="h-80 w-full rounded-xl xl:col-span-2" />
        <Skeleton className="h-80 w-full rounded-xl xl:col-span-3" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const summaryQuery = useQuery(dashboardSummaryQueryOptions());
  const summary = summaryQuery.data;

  function renderContent() {
    if (summaryQuery.isError) {
      return <ErrorState error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />;
    }
    if (summary === undefined) {
      return <DashboardSkeleton />;
    }
    const totalCount = summary.statusCounts.reduce((total, { count }) => total + count, 0);
    return (
      <>
        <DashboardStatTiles summary={summary} />
        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>{t("dashboard.statusChart.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {totalCount === 0 ? (
                <EmptyState icon={ClipboardListIcon} title={t("dashboard.statusChart.empty")} />
              ) : (
                <StatusChart statusCounts={summary.statusCounts} />
              )}
            </CardContent>
          </Card>
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>{t("dashboard.technicians.title")}</CardTitle>
              <CardDescription>
                {t("dashboard.technicians.description", {
                  weekStart: formatCalendarDate(summary.weekStart, language),
                  weekEnd: formatCalendarDate(summary.weekEnd, language),
                })}
              </CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/dispatch?week=${summary.weekStart}`}>
                    <CalendarRangeIcon aria-hidden="true" />
                    {t("dashboard.workload.dispatchLink")}
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {summary.technicians.length === 0 ? (
                <EmptyState icon={UsersIcon} title={t("dashboard.workload.empty")} />
              ) : (
                <TechnicianWorkloadTable technicians={summary.technicians} />
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("dashboard.title")}
        description={
          summary === undefined ? undefined : (
            <>
              {t("dashboard.generatedAt", { time: formatDateTime(summary.generatedAt, language) })}
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={t("dashboard.refresh")}
                title={t("dashboard.refresh")}
                disabled={summaryQuery.isFetching}
                onClick={() => void summaryQuery.refetch()}
              >
                <RefreshCwIcon
                  aria-hidden="true"
                  className={summaryQuery.isFetching ? "animate-spin" : ""}
                />
              </Button>
            </>
          )
        }
      />
      {renderContent()}
    </div>
  );
}
