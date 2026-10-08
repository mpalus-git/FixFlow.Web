import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap, unwrapVersioned } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import type { operations } from "@/shared/api/schema";
import type { WorkOrderListParams } from "@/features/work-orders/hooks/useWorkOrderListSearchParams";

type ListWorkOrdersQuery = NonNullable<operations["ListWorkOrders"]["parameters"]["query"]>;

export const workOrderListPageSize = 20;

export const workOrderHistoryPageSize = 10;

export type WorkOrderHistoryFilter = { clientId: string } | { deviceId: string };

export type WorkOrderHistoryParams = {
  filter: WorkOrderHistoryFilter;
  page: number;
};

export const workOrderKeys = {
  all: queryKeyRoots.workOrders,
  lists: () => [...workOrderKeys.all, "list"] as const,
  history: (params: WorkOrderHistoryParams) =>
    [...workOrderKeys.lists(), "history", params] as const,
  list: (params: WorkOrderListParams) => [...workOrderKeys.lists(), "all", params] as const,
  details: () => [...workOrderKeys.all, "detail"] as const,
  detail: (workOrderId: string) => [...workOrderKeys.details(), workOrderId] as const,
  serviceEntries: (workOrderId: string) =>
    [...workOrderKeys.all, "serviceEntries", workOrderId] as const,
  events: (workOrderId: string) => [...workOrderKeys.all, "events", workOrderId] as const,
};

function toListWorkOrdersQuery({
  page,
  search,
  filters,
  sort,
}: WorkOrderListParams): ListWorkOrdersQuery {
  return {
    page,
    pageSize: workOrderListPageSize,
    ...sort,
    ...(search === "" ? {} : { search }),
    ...(filters.status.length === 0 ? {} : { status: [...filters.status] }),
    ...(filters.technicianId === null ? {} : { technicianId: filters.technicianId }),
    ...(filters.dueFrom === null ? {} : { dueFrom: filters.dueFrom }),
    ...(filters.dueTo === null ? {} : { dueTo: filters.dueTo }),
    ...(filters.overdueOnly ? { isOverdue: true } : {}),
  };
}

export function workOrderListQueryOptions(params: WorkOrderListParams) {
  return queryOptions({
    queryKey: workOrderKeys.list(params),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders", {
          params: { query: toListWorkOrdersQuery(params) },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function workOrderHistoryQueryOptions({ filter, page }: WorkOrderHistoryParams) {
  return queryOptions({
    queryKey: workOrderKeys.history({ filter, page }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders", {
          params: {
            query: {
              ...filter,
              page,
              pageSize: workOrderHistoryPageSize,
              sortBy: "DueDate",
              sortDirection: "Desc",
            },
          },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function workOrderQueryOptions(workOrderId: string) {
  return queryOptions({
    queryKey: workOrderKeys.detail(workOrderId),
    queryFn: async ({ signal }) =>
      unwrapVersioned(
        await apiClient.GET("/api/v1/work-orders/{workOrderId}", {
          params: { path: { workOrderId } },
          signal,
        }),
      ),
  });
}

export function workOrderEventsQueryOptions(workOrderId: string) {
  return queryOptions({
    queryKey: workOrderKeys.events(workOrderId),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders/{workOrderId}/events", {
          params: { path: { workOrderId } },
          signal,
        }),
      ),
  });
}

export function serviceEntriesQueryOptions(workOrderId: string) {
  return queryOptions({
    queryKey: workOrderKeys.serviceEntries(workOrderId),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders/{workOrderId}/service-entries", {
          params: { path: { workOrderId } },
          signal,
        }),
      ),
  });
}
