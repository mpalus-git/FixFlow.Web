import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon, UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  unassignedWorkOrdersQueryOptions,
  weekWorkOrdersQueryOptions,
} from "@/features/dispatch/api/dispatchQueries";
import { DispatchBoardGrid } from "@/features/dispatch/components/DispatchBoardGrid";
import { buildDispatchBoard } from "@/features/dispatch/dispatchBoard";
import { useDispatchWeekParam } from "@/features/dispatch/hooks/useDispatchWeekParam";
import { technicianOptionsQueryOptions } from "@/shared/api/technicianQueries";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { addCalendarDays, formatCalendarDate } from "@/shared/lib/dateTime";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PageTitle } from "@/shared/ui/PageTitle";

export function DispatchPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { weekStart, currentWeekStart, setWeekStart } = useDispatchWeekParam();
  const weekQuery = useQuery(weekWorkOrdersQueryOptions(weekStart));
  const unassignedQuery = useQuery(unassignedWorkOrdersQueryOptions());
  const techniciansQuery = useQuery(technicianOptionsQueryOptions());
  const queries = [weekQuery, unassignedQuery, techniciansQuery];

  function renderContent() {
    if (queries.some((query) => query.isError)) {
      return (
        <ErrorState
          error={queries.find((query) => query.isError)?.error}
          onRetry={() => {
            for (const query of queries) {
              if (query.isError) {
                void query.refetch();
              }
            }
          }}
        />
      );
    }
    if (
      weekQuery.data === undefined ||
      unassignedQuery.data === undefined ||
      techniciansQuery.data === undefined
    ) {
      return <ListSkeleton rows={6} />;
    }
    const board = buildDispatchBoard({
      weekStart,
      weekWorkOrders: weekQuery.data.items,
      unassignedWorkOrders: unassignedQuery.data.items,
      technicians: techniciansQuery.data,
    });
    if (board.rows.length === 0) {
      return (
        <EmptyState
          icon={UsersIcon}
          title={t("dispatch.noTechnicians.title")}
          description={t("dispatch.noTechnicians.description")}
        />
      );
    }
    const pages = [weekQuery.data, unassignedQuery.data];
    const isTruncated = pages.some((page) => page.totalCount > page.items.length);
    const hasAssignedWork = weekQuery.data.items.some((item) => item.technicianId !== null);

    return (
      <div
        aria-busy={weekQuery.isPlaceholderData}
        className={cn("flex flex-col gap-3", weekQuery.isPlaceholderData && "opacity-60")}
      >
        {isTruncated ? (
          <Alert>
            <AlertDescription>{t("dispatch.limit")}</AlertDescription>
          </Alert>
        ) : null}
        {hasAssignedWork ? null : (
          <p className="text-sm text-muted-foreground">{t("dispatch.emptyWeek")}</p>
        )}
        <DispatchBoardGrid board={board} weekStart={weekStart} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title={t("dispatch.title")} />
        <h1 className="text-2xl font-semibold tracking-tight">{t("dispatch.title")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={t("dispatch.week.previous")}
            onClick={() => {
              setWeekStart(addCalendarDays(weekStart, -7));
            }}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <p aria-live="polite" className="min-w-48 text-center text-sm font-medium tabular-nums">
            {t("dispatch.week.range", {
              from: formatCalendarDate(weekStart, language),
              to: formatCalendarDate(addCalendarDays(weekStart, 6), language),
            })}
          </p>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("dispatch.week.next")}
            onClick={() => {
              setWeekStart(addCalendarDays(weekStart, 7));
            }}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            disabled={weekStart === currentWeekStart}
            onClick={() => {
              setWeekStart(currentWeekStart);
            }}
          >
            {t("dispatch.week.current")}
          </Button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
