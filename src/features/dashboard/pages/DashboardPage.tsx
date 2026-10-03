import { useQuery } from "@tanstack/react-query";
import { CalendarRangeIcon, ClipboardListIcon, RefreshCwIcon, UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { dashboardSummaryQueryOptions } from "@/features/dashboard/api/dashboardQueries";
import { DashboardStatTiles } from "@/features/dashboard/components/DashboardStatTiles";
import { StatusChart } from "@/features/dashboard/components/StatusChart";
import { TechnicianWorkloadChart } from "@/features/dashboard/components/TechnicianWorkloadChart";
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
import { PageTitle } from "@/shared/ui/PageTitle";

function DashboardSkeleton() {
  const { t } = useTranslation();

  return (
    <div role="status" aria-label={t("states.loading")} className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
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
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.statusChart.title")}</CardTitle>
              <CardDescription>{t("dashboard.statusChart.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {totalCount === 0 ? (
                <EmptyState icon={ClipboardListIcon} title={t("dashboard.statusChart.empty")} />
              ) : (
                <StatusChart statusCounts={summary.statusCounts} />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.workload.title")}</CardTitle>
              <CardDescription>{t("dashboard.workload.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.technicians.length === 0 ? (
                <EmptyState icon={UsersIcon} title={t("dashboard.workload.empty")} />
              ) : (
                <TechnicianWorkloadChart technicians={summary.technicians} />
              )}
            </CardContent>
          </Card>
        </div>
        {summary.technicians.length === 0 ? null : (
          <Card>
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
              <TechnicianWorkloadTable technicians={summary.technicians} />
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <PageTitle title={t("dashboard.title")} />
          <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
          {summary === undefined ? null : (
            <p className="text-sm text-muted-foreground">
              {t("dashboard.generatedAt", {
                time: formatDateTime(summary.generatedAt, language),
              })}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          disabled={summaryQuery.isFetching}
          onClick={() => void summaryQuery.refetch()}
        >
          <RefreshCwIcon
            aria-hidden="true"
            className={summaryQuery.isFetching ? "animate-spin" : ""}
          />
          {t("dashboard.refresh")}
        </Button>
      </div>
      {renderContent()}
    </div>
  );
}
