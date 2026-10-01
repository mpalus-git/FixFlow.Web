import {
  type CellData,
  createColumnHelper,
  type HeaderContext,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WorkOrderPriorityBadge } from "@/features/work-orders/components/WorkOrderPriorityBadge";
import { WorkOrderStatusBadge } from "@/features/work-orders/components/WorkOrderStatusBadge";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime } from "@/shared/lib/dateTime";
import { Badge } from "@/shared/ui/badge";
import { SortableHeader } from "@/shared/ui/SortableHeader";

export type WorkOrderListItem = components["schemas"]["WorkOrderListItemResponse"];

export const workOrderTableFeatures = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof workOrderTableFeatures, WorkOrderListItem>();

export type WorkOrderColumnId =
  "dueDate" | "clientName" | "device" | "description" | "priority" | "status" | "technician";

function sortableHeader<TValue extends CellData>(label: string) {
  return function Header({
    column,
  }: HeaderContext<typeof workOrderTableFeatures, WorkOrderListItem, TValue>) {
    if (!column.getCanSort()) {
      return label;
    }
    return (
      <SortableHeader
        label={label}
        sorted={column.getIsSorted()}
        onToggle={() => {
          column.toggleSorting();
        }}
      />
    );
  };
}

export function useWorkOrderColumns(columnIds: readonly WorkOrderColumnId[]) {
  const { t } = useTranslation();
  const language = useLanguage();

  return useMemo(() => {
    const allColumns = columnHelper.columns([
      columnHelper.accessor("dueDate", {
        id: "dueDate",
        header: sortableHeader(t("workOrders.columns.dueDate")),
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            {formatDateTime(row.original.dueDate, language)}
            {row.original.isOverdue ? (
              <Badge variant="destructive">{t("workOrders.overdue")}</Badge>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("clientName", {
        id: "clientName",
        header: sortableHeader(t("workOrders.columns.client")),
        cell: (info) => (
          <span className="block max-w-48 font-medium whitespace-normal">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("deviceSerialNumber", {
        id: "device",
        header: t("workOrders.columns.device"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.deviceSerialNumber}</span>
            <span className="text-muted-foreground">{row.original.deviceModel}</span>
          </div>
        ),
      }),
      columnHelper.accessor("description", {
        id: "description",
        header: t("workOrders.columns.description"),
        enableSorting: false,
        cell: (info) => (
          <span className="block max-w-48 truncate" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("priority", {
        id: "priority",
        header: sortableHeader(t("workOrders.columns.priority")),
        cell: (info) => <WorkOrderPriorityBadge priority={info.getValue()} />,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: sortableHeader(t("workOrders.columns.status")),
        cell: (info) => <WorkOrderStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("technicianEmail", {
        id: "technician",
        header: t("workOrders.columns.technician"),
        enableSorting: false,
        cell: (info) =>
          info.getValue() ?? (
            <span className="text-muted-foreground">{t("workOrders.unassigned")}</span>
          ),
      }),
    ]);
    return columnIds.flatMap((columnId) => allColumns.filter((column) => column.id === columnId));
  }, [t, language, columnIds]);
}
