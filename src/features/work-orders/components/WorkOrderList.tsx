import { useQuery } from "@tanstack/react-query";
import { ClipboardListIcon, SearchXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  workOrderListPageSize,
  workOrderListQueryOptions,
} from "@/features/work-orders/api/workOrderQueries";
import { WorkOrderFilters } from "@/features/work-orders/components/WorkOrderFilters";
import { WorkOrdersTable } from "@/features/work-orders/components/WorkOrdersTable";
import {
  hasActiveFilters,
  useWorkOrderListSearchParams,
} from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import {
  hasSameStatuses,
  openWorkOrderStatuses,
  type WorkOrderStatus,
} from "@/features/work-orders/workOrderRules";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";

const noDefaultStatus: readonly WorkOrderStatus[] = [];

export type WorkOrderListProps = {
  scope: "all" | "assignedToMe";
};

export function WorkOrderList({ scope }: WorkOrderListProps) {
  const { t } = useTranslation();
  const isDispatcherScope = scope === "all";
  const defaultStatus = isDispatcherScope ? noDefaultStatus : openWorkOrderStatuses;
  const { page, search, filters, sort, setPage, setSearch, setFilters, clearFilters, setSort } =
    useWorkOrderListSearchParams(defaultStatus);
  const listParams = { page, search, filters, sort };
  const workOrdersQuery = useQuery(workOrderListQueryOptions(listParams));
  const workOrderPage = workOrdersQuery.data;
  const isFiltered = hasActiveFilters(listParams, defaultStatus);
  useKeepPageInRange({
    page,
    pageSize: workOrderListPageSize,
    totalCount: workOrderPage?.totalCount,
    isPlaceholderData: workOrdersQuery.isPlaceholderData,
    setPage,
  });

  function renderContent() {
    if (workOrdersQuery.isError) {
      return (
        <ErrorState error={workOrdersQuery.error} onRetry={() => void workOrdersQuery.refetch()} />
      );
    }
    if (workOrderPage === undefined) {
      return <ListSkeleton />;
    }
    if (workOrderPage.totalCount === 0) {
      const isFilteredOnlyByStatus = !hasActiveFilters({
        ...listParams,
        filters: { ...filters, status: [] },
      });
      if (!isDispatcherScope && isFilteredOnlyByStatus) {
        if (filters.status.length === 0) {
          return <EmptyState icon={ClipboardListIcon} title={t("workOrders.empty.assignedToMe")} />;
        }
        if (hasSameStatuses(filters.status, openWorkOrderStatuses)) {
          return (
            <EmptyState icon={ClipboardListIcon} title={t("workOrders.empty.noOpenAssigned")} />
          );
        }
      }
      return isFiltered ? (
        <EmptyState
          icon={SearchXIcon}
          title={t("workOrders.noResults.title")}
          description={t("workOrders.noResults.description")}
        />
      ) : (
        <EmptyState icon={ClipboardListIcon} title={t("workOrders.empty.title")} />
      );
    }
    return (
      <>
        <WorkOrdersTable
          workOrders={workOrderPage.items}
          isUpdating={workOrdersQuery.isPlaceholderData}
          sort={sort}
          onSortChange={setSort}
          showTechnician={isDispatcherScope}
          showActions={isDispatcherScope}
          detailsBasePath={isDispatcherScope ? "/work-orders" : "/my-work-orders"}
          label={t(isDispatcherScope ? "workOrders.title" : "myWorkOrders.title")}
        />
        <PaginationControls
          page={page}
          pageSize={workOrderListPageSize}
          totalCount={workOrderPage.totalCount}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        label={t("workOrders.search.label")}
        placeholder={t("workOrders.search.placeholder")}
        value={search}
        maxLength={100}
        onSearch={setSearch}
      />
      <WorkOrderFilters
        filters={filters}
        onChange={setFilters}
        showTechnicianFilter={isDispatcherScope}
        canClear={isFiltered}
        onClear={clearFilters}
      />
      {renderContent()}
    </div>
  );
}
