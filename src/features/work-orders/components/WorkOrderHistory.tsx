import { useQuery } from "@tanstack/react-query";
import { useTable } from "@tanstack/react-table";
import { ClipboardListIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type WorkOrderHistoryFilter,
  workOrderHistoryPageSize,
  workOrderHistoryQueryOptions,
} from "@/features/work-orders/api/workOrderQueries";
import {
  type WorkOrderColumnId,
  useWorkOrderColumns,
  workOrderTableFeatures,
} from "@/features/work-orders/hooks/useWorkOrderColumns";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { usePageSearchParam } from "@/shared/lib/useListSearchParams";
import { DataTable } from "@/shared/ui/DataTable";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";

const clientHistoryColumnIds: readonly WorkOrderColumnId[] = [
  "number",
  "dueDate",
  "device",
  "description",
  "priority",
  "status",
  "technician",
];

const deviceHistoryColumnIds: readonly WorkOrderColumnId[] = clientHistoryColumnIds.filter(
  (columnId) => columnId !== "device",
);

export type WorkOrderHistoryProps = {
  filter: WorkOrderHistoryFilter;
};

export function WorkOrderHistory({ filter }: WorkOrderHistoryProps) {
  const { t } = useTranslation();
  const { page, setPage } = usePageSearchParam("ordersPage");
  const historyQuery = useQuery(workOrderHistoryQueryOptions({ filter, page }));
  const historyPage = historyQuery.data;
  useKeepPageInRange({
    page,
    pageSize: workOrderHistoryPageSize,
    totalCount: historyPage?.totalCount,
    isPlaceholderData: historyQuery.isPlaceholderData,
    setPage,
  });
  const isDeviceHistory = "deviceId" in filter;
  const columns = useWorkOrderColumns(
    isDeviceHistory ? deviceHistoryColumnIds : clientHistoryColumnIds,
    "/work-orders",
  );
  const table = useTable({
    features: workOrderTableFeatures,
    columns,
    enableSorting: false,
    data: historyPage?.items ?? [],
    getRowId: (workOrder) => workOrder.id,
  });

  if (historyQuery.isError) {
    return (
      <ErrorState compact error={historyQuery.error} onRetry={() => void historyQuery.refetch()} />
    );
  }
  if (historyPage === undefined) {
    return <ListSkeleton rows={3} />;
  }
  if (historyPage.totalCount === 0) {
    return (
      <EmptyState
        compact
        icon={ClipboardListIcon}
        title={t(
          isDeviceHistory ? "workOrders.deviceHistoryEmpty" : "workOrders.clientHistoryEmpty",
        )}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        table={table}
        label={t("workOrders.title")}
        isUpdating={historyQuery.isPlaceholderData}
      />
      <PaginationControls
        page={page}
        pageSize={workOrderHistoryPageSize}
        totalCount={historyPage.totalCount}
        onPageChange={setPage}
        label={t("workOrders.historyPagination")}
      />
    </div>
  );
}
