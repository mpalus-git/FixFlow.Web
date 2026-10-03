import { type SortingState, type Updater, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  type WorkOrderColumnId,
  type WorkOrderDetailsBasePath,
  type WorkOrderListItem,
  useWorkOrderColumns,
  workOrderTableFeatures,
} from "@/features/work-orders/hooks/useWorkOrderColumns";
import {
  defaultWorkOrderSort,
  type WorkOrderSort,
  type WorkOrderSortBy,
} from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import { DataTable } from "@/shared/ui/DataTable";

const baseColumnIds: readonly WorkOrderColumnId[] = [
  "number",
  "dueDate",
  "clientName",
  "device",
  "description",
  "priority",
  "status",
];

const sortFieldsByColumnId = {
  dueDate: "DueDate",
  clientName: "ClientName",
  priority: "Priority",
  status: "Status",
} as const satisfies Partial<Record<WorkOrderColumnId, WorkOrderSortBy>>;

function cellClassName(columnId: string): string {
  if (columnId === "description") {
    return "hidden px-3 2xl:table-cell";
  }
  return columnId === "actions" ? "sticky right-0 bg-background px-3" : "px-3";
}

function toSortingState({ sortBy, sortDirection }: WorkOrderSort): SortingState {
  const entry = Object.entries(sortFieldsByColumnId).find(([, field]) => field === sortBy);
  return entry === undefined ? [] : [{ id: entry[0], desc: sortDirection === "Desc" }];
}

function toWorkOrderSort(sorting: SortingState): WorkOrderSort {
  const [columnSort] = sorting;
  const entry = Object.entries(sortFieldsByColumnId).find(
    ([columnId]) => columnId === columnSort?.id,
  );
  if (columnSort === undefined || entry === undefined) {
    return defaultWorkOrderSort;
  }
  return { sortBy: entry[1], sortDirection: columnSort.desc ? "Desc" : "Asc" };
}

export type WorkOrdersTableProps = {
  workOrders: WorkOrderListItem[];
  isUpdating: boolean;
  sort: WorkOrderSort;
  onSortChange: (sort: WorkOrderSort) => void;
  showTechnician: boolean;
  showActions: boolean;
  detailsBasePath: WorkOrderDetailsBasePath;
  label: string;
};

export function WorkOrdersTable({
  workOrders,
  isUpdating,
  sort,
  onSortChange,
  showTechnician,
  showActions,
  detailsBasePath,
  label,
}: WorkOrdersTableProps) {
  const columnIds = useMemo(
    () => [
      ...baseColumnIds,
      ...(showTechnician ? (["technician"] as const) : []),
      ...(showActions ? (["actions"] as const) : []),
    ],
    [showTechnician, showActions],
  );
  const columns = useWorkOrderColumns(columnIds, detailsBasePath);
  const sorting = toSortingState(sort);
  const table = useTable({
    features: workOrderTableFeatures,
    columns,
    data: workOrders,
    getRowId: (workOrder) => workOrder.id,
    state: { sorting },
    onSortingChange: (updater: Updater<SortingState>) => {
      onSortChange(toWorkOrderSort(typeof updater === "function" ? updater(sorting) : updater));
    },
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  return (
    <DataTable
      table={table}
      label={label}
      isUpdating={isUpdating}
      sorting={sorting}
      cellClassName={cellClassName}
    />
  );
}
