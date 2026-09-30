import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

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
};

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
