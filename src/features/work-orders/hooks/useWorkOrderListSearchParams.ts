import { z } from "zod";
import {
  hasSameStatuses,
  orderedStatuses,
  type WorkOrderStatus,
} from "@/features/work-orders/workOrderRules";
import type { operations } from "@/shared/api/schema";
import { isCalendarDate } from "@/shared/lib/dateTime";
import { pageValue, readPageParam, useSearchParamsUpdate } from "@/shared/lib/useListSearchParams";

type ListWorkOrdersQuery = NonNullable<operations["ListWorkOrders"]["parameters"]["query"]>;
export type WorkOrderSortBy = NonNullable<ListWorkOrdersQuery["sortBy"]>;
type SortDirection = NonNullable<ListWorkOrdersQuery["sortDirection"]>;

const workOrderSortFields = [
  "DueDate",
  "CreatedAt",
  "Priority",
  "Status",
  "ClientName",
] as const satisfies readonly WorkOrderSortBy[];

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

const allStatusesParam = "all";

const sortBySchema = z.enum(workOrderSortFields);
const sortDirectionSchema = z.enum(["Asc", "Desc"]);
const technicianIdSchema = z.uuid();

function parseParam<T>(schema: z.ZodType<T>, value: string | null): T | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}

function readCalendarDate(value: string | null): string | null {
  return value !== null && isCalendarDate(value) ? value : null;
}

function readStatus(
  values: readonly string[],
  defaultStatus: readonly WorkOrderStatus[],
): WorkOrderStatus[] {
  if (values.length === 0) {
    return [...defaultStatus];
  }
  return values.includes(allStatusesParam) ? [] : orderedStatuses(values);
}

export function readWorkOrderListParams(
  searchParams: URLSearchParams,
  defaultStatus: readonly WorkOrderStatus[] = [],
): WorkOrderListParams {
  const dueFrom = readCalendarDate(searchParams.get("dueFrom"));
  const dueTo = readCalendarDate(searchParams.get("dueTo"));

  return {
    page: readPageParam(searchParams.get("page")),
    search: searchParams.get("search") ?? "",
    filters: {
      status: readStatus(searchParams.getAll("status"), defaultStatus),
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

export function hasActiveFilters(
  { search, filters }: WorkOrderListParams,
  defaultStatus: readonly WorkOrderStatus[] = [],
): boolean {
  return (
    search !== "" ||
    !hasSameStatuses(filters.status, defaultStatus) ||
    filters.technicianId !== null ||
    filters.dueFrom !== null ||
    filters.dueTo !== null ||
    filters.overdueOnly
  );
}

function statusValue(
  status: readonly WorkOrderStatus[],
  defaultStatus: readonly WorkOrderStatus[],
): string | readonly string[] | null {
  if (hasSameStatuses(status, defaultStatus)) {
    return null;
  }
  return status.length === 0 ? allStatusesParam : status;
}

function filterValues(
  filters: Partial<WorkOrderListFilters>,
  defaultStatus: readonly WorkOrderStatus[],
): Record<string, string | readonly string[] | null> {
  const values: Record<string, string | readonly string[] | null> = {};
  if (filters.status !== undefined) {
    values.status = statusValue(filters.status, defaultStatus);
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

export function useWorkOrderListSearchParams(defaultStatus: readonly WorkOrderStatus[] = []) {
  const [searchParams, update] = useSearchParamsUpdate();

  return {
    ...readWorkOrderListParams(searchParams, defaultStatus),
    setPage: (page: number) => {
      update({ page: pageValue(page) });
    },
    setSearch: (search: string) => {
      update({ search, page: null });
    },
    setFilters: (filters: Partial<WorkOrderListFilters>) => {
      update({ ...filterValues(filters, defaultStatus), page: null });
    },
    clearFilters: () => {
      update({
        ...filterValues({ ...emptyFilters, status: defaultStatus }, defaultStatus),
        search: null,
        page: null,
      });
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
