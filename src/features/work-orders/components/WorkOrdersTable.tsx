import { type SortingState, type Updater, useTable } from "@tanstack/react-table";
import {
  type WorkOrderColumnId,
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

const allColumnIds: readonly WorkOrderColumnId[] = [
  "dueDate",
  "clientName",
  "device",
  "description",
  "priority",
  "status",
  "technician",
];

const columnIdsWithoutTechnician = allColumnIds.filter((columnId) => columnId !== "technician");

const sortFieldsByColumnId = {
  dueDate: "DueDate",
  clientName: "ClientName",
  priority: "Priority",
  status: "Status",
} as const satisfies Partial<Record<WorkOrderColumnId, WorkOrderSortBy>>;

function cellClassName(columnId: string): string {
  return columnId === "description" ? "hidden px-3 2xl:table-cell" : "px-3";
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
};

export function WorkOrdersTable({
  workOrders,
  isUpdating,
  sort,
  onSortChange,
  showTechnician,
}: WorkOrdersTableProps) {
  const columns = useWorkOrderColumns(showTechnician ? allColumnIds : columnIdsWithoutTechnician);
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
      isUpdating={isUpdating}
      sorting={sorting}
      cellClassName={cellClassName}
    />
  );
}
