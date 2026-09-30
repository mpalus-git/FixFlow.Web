import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { ClipboardListIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  clientWorkOrderHistoryQueryOptions,
  workOrderHistoryPageSize,
} from "@/features/work-orders/api/workOrderQueries";
import { WorkOrderPriorityBadge } from "@/features/work-orders/components/WorkOrderPriorityBadge";
import { WorkOrderStatusBadge } from "@/features/work-orders/components/WorkOrderStatusBadge";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime } from "@/shared/lib/dateTime";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { usePageSearchParam } from "@/shared/lib/useListSearchParams";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/DataTable";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";

type WorkOrderListItem = components["schemas"]["WorkOrderListItemResponse"];

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, WorkOrderListItem>();

export type ClientWorkOrderHistoryProps = {
  clientId: string;
};

export function ClientWorkOrderHistory({ clientId }: ClientWorkOrderHistoryProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { page, setPage } = usePageSearchParam("ordersPage");
  const historyQuery = useQuery(clientWorkOrderHistoryQueryOptions({ clientId, page }));
  const historyPage = historyQuery.data;
  useKeepPageInRange({
    page,
    pageSize: workOrderHistoryPageSize,
    totalCount: historyPage?.totalCount,
    isPlaceholderData: historyQuery.isPlaceholderData,
    setPage,
  });
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("dueDate", {
          header: t("workOrders.columns.dueDate"),
          cell: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
              {formatDateTime(row.original.dueDate, language)}
              {row.original.isOverdue ? (
                <Badge variant="destructive">{t("workOrders.overdue")}</Badge>
              ) : null}
            </div>
          ),
        }),
        columnHelper.accessor("deviceSerialNumber", {
          header: t("workOrders.columns.device"),
          cell: ({ row }) => (
            <div className="flex flex-col">
              <span className="font-medium">{row.original.deviceSerialNumber}</span>
              <span className="text-muted-foreground">{row.original.deviceModel}</span>
            </div>
          ),
        }),
        columnHelper.accessor("description", {
          header: t("workOrders.columns.description"),
          cell: (info) => (
            <span className="block max-w-48 truncate" title={info.getValue()}>
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("priority", {
          header: t("workOrders.columns.priority"),
          cell: (info) => <WorkOrderPriorityBadge priority={info.getValue()} />,
        }),
        columnHelper.accessor("status", {
          header: t("workOrders.columns.status"),
          cell: (info) => <WorkOrderStatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor("technicianEmail", {
          header: t("workOrders.columns.technician"),
          cell: (info) =>
            info.getValue() ?? (
              <span className="text-muted-foreground">{t("workOrders.unassigned")}</span>
            ),
        }),
      ]),
    [t, language],
  );
  const table = useTable({
    features,
    columns,
    data: historyPage?.items ?? [],
    getRowId: (workOrder) => workOrder.id,
  });

  if (historyQuery.isError) {
    return <ErrorState onRetry={() => void historyQuery.refetch()} />;
  }
  if (historyPage === undefined) {
    return <ListSkeleton rows={3} />;
  }
  if (historyPage.totalCount === 0) {
    return <EmptyState icon={ClipboardListIcon} title={t("workOrders.clientHistoryEmpty")} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable table={table} isUpdating={historyQuery.isPlaceholderData} />
      <PaginationControls
        page={page}
        pageSize={workOrderHistoryPageSize}
        totalCount={historyPage.totalCount}
        onPageChange={setPage}
      />
    </div>
  );
}
