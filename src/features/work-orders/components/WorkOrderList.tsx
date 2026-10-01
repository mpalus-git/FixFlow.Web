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
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";

export type WorkOrderListProps = {
  scope: "all" | "assignedToMe";
};

export function WorkOrderList({ scope }: WorkOrderListProps) {
  const { t } = useTranslation();
  const { page, search, filters, sort, setPage, setSearch, setFilters, clearFilters, setSort } =
    useWorkOrderListSearchParams();
  const listParams = { page, search, filters, sort };
  const workOrdersQuery = useQuery(workOrderListQueryOptions(listParams));
  const workOrderPage = workOrdersQuery.data;
  const isFiltered = hasActiveFilters(listParams);
  const isDispatcherScope = scope === "all";
  useKeepPageInRange({
    page,
    pageSize: workOrderListPageSize,
    totalCount: workOrderPage?.totalCount,
    isPlaceholderData: workOrdersQuery.isPlaceholderData,
    setPage,
  });

  function renderContent() {
    if (workOrdersQuery.isError) {
      return <ErrorState onRetry={() => void workOrdersQuery.refetch()} />;
    }
    if (workOrderPage === undefined) {
      return <ListSkeleton />;
    }
    if (workOrderPage.totalCount === 0) {
      return isFiltered ? (
        <EmptyState
          icon={SearchXIcon}
          title={t("workOrders.noResults.title")}
          description={t("workOrders.noResults.description")}
        />
      ) : (
        <EmptyState
          icon={ClipboardListIcon}
          title={t(scope === "all" ? "workOrders.empty.title" : "workOrders.empty.assignedToMe")}
        />
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
