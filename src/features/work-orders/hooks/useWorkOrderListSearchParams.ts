import { z } from "zod";
import type { components, operations } from "@/shared/api/schema";
import { isCalendarDate } from "@/shared/lib/dateTime";
import { pageValue, readPageParam, useSearchParamsUpdate } from "@/shared/lib/useListSearchParams";

type ListWorkOrdersQuery = NonNullable<operations["ListWorkOrders"]["parameters"]["query"]>;
export type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];
export type WorkOrderSortBy = NonNullable<ListWorkOrdersQuery["sortBy"]>;
export type SortDirection = NonNullable<ListWorkOrdersQuery["sortDirection"]>;

export const workOrderStatuses = [
  "New",
  "Assigned",
  "InProgress",
  "Completed",
  "Invoiced",
] as const satisfies readonly WorkOrderStatus[];

const workOrderSortFields = [
  "DueDate",
  "CreatedAt",
  "Priority",
  "Status",
  "ClientName",
] as const satisfies readonly WorkOrderSortBy[];

export const openWorkOrderStatuses = [
  "New",
  "Assigned",
  "InProgress",
] as const satisfies readonly WorkOrderStatus[];

export type WorkOrderListFilters = {
  status: readonly WorkOrderStatus[];
  technicianId: string | null;
  dueFrom: string | null;
  dueTo: string | null;
  overdueOnly: boolean;
};

export type WorkOrderSort = {
  sortBy: WorkOrderSortBy;
  sortDirection: SortDirection;
};

export type WorkOrderListParams = {
  page: number;
  search: string;
  filters: WorkOrderListFilters;
  sort: WorkOrderSort;
};

export const defaultWorkOrderSort: WorkOrderSort = { sortBy: "DueDate", sortDirection: "Asc" };

const emptyFilters: WorkOrderListFilters = {
  status: [],
  technicianId: null,
  dueFrom: null,
  dueTo: null,
  overdueOnly: false,
};

const sortBySchema = z.enum(workOrderSortFields);
const sortDirectionSchema = z.enum(["Asc", "Desc"]);
const technicianIdSchema = z.uuid();

function parseParam<T>(schema: z.ZodType<T>, value: string | null): T | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}

export function orderedStatuses(values: readonly string[]): WorkOrderStatus[] {
  return workOrderStatuses.filter((status) => values.includes(status));
}

function readCalendarDate(value: string | null): string | null {
  return value !== null && isCalendarDate(value) ? value : null;
}

export function readWorkOrderListParams(searchParams: URLSearchParams): WorkOrderListParams {
  const dueFrom = readCalendarDate(searchParams.get("dueFrom"));
  const dueTo = readCalendarDate(searchParams.get("dueTo"));

  return {
    page: readPageParam(searchParams.get("page")),
    search: searchParams.get("search") ?? "",
    filters: {
      status: orderedStatuses(searchParams.getAll("status")),
      technicianId: parseParam(technicianIdSchema, searchParams.get("technician")),
      dueFrom,
      dueTo: dueFrom !== null && dueTo !== null && dueTo < dueFrom ? null : dueTo,
      overdueOnly: searchParams.get("overdue") === "true",
    },
    sort: {
      sortBy: parseParam(sortBySchema, searchParams.get("sort")) ?? defaultWorkOrderSort.sortBy,
      sortDirection:
        parseParam(sortDirectionSchema, searchParams.get("direction")) ??
        defaultWorkOrderSort.sortDirection,
    },
  };
}

export function hasActiveFilters({ search, filters }: WorkOrderListParams): boolean {
  return (
    search !== "" ||
    filters.status.length > 0 ||
    filters.technicianId !== null ||
    filters.dueFrom !== null ||
    filters.dueTo !== null ||
    filters.overdueOnly
  );
}

function filterValues(
  filters: Partial<WorkOrderListFilters>,
): Record<string, string | readonly string[] | null> {
  const values: Record<string, string | readonly string[] | null> = {};
  if (filters.status !== undefined) {
    values.status = filters.status;
  }
  if (filters.technicianId !== undefined) {
    values.technician = filters.technicianId;
  }
  if (filters.dueFrom !== undefined) {
    values.dueFrom = filters.dueFrom;
  }
  if (filters.dueTo !== undefined) {
    values.dueTo = filters.dueTo;
  }
  if (filters.overdueOnly !== undefined) {
    values.overdue = filters.overdueOnly ? "true" : null;
  }
  return values;
}

export function useWorkOrderListSearchParams() {
  const [searchParams, update] = useSearchParamsUpdate();

  return {
    ...readWorkOrderListParams(searchParams),
    setPage: (page: number) => {
      update({ page: pageValue(page) });
    },
    setSearch: (search: string) => {
      update({ search, page: null });
    },
    setFilters: (filters: Partial<WorkOrderListFilters>) => {
      update({ ...filterValues(filters), page: null });
    },
    clearFilters: () => {
      update({ ...filterValues(emptyFilters), search: null, page: null });
    },
    setSort: (sort: WorkOrderSort) => {
      const isDefault =
        sort.sortBy === defaultWorkOrderSort.sortBy &&
        sort.sortDirection === defaultWorkOrderSort.sortDirection;
      update({
        sort: isDefault ? null : sort.sortBy,
        direction: isDefault ? null : sort.sortDirection,
        page: null,
      });
    },
  };
}
