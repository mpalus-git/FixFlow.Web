import { useQuery } from "@tanstack/react-query";
import { ClipboardListIcon, RefreshCwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { dashboardSummaryQueryOptions } from "@/features/dashboard/api/dashboardQueries";
import { DashboardStatTiles } from "@/features/dashboard/components/DashboardStatTiles";
import { StatusChart } from "@/features/dashboard/components/StatusChart";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime } from "@/shared/lib/dateTime";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/skeleton";

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
      return <ErrorState onRetry={() => void summaryQuery.refetch()} />;
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
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
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
