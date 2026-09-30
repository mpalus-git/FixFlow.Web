import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const workOrderHistoryPageSize = 10;

export type ClientWorkOrderHistoryParams = {
  clientId: string;
  page: number;
};

export const workOrderKeys = {
  all: queryKeyRoots.workOrders,
  lists: () => [...workOrderKeys.all, "list"] as const,
  clientHistory: (params: ClientWorkOrderHistoryParams) =>
    [...workOrderKeys.lists(), "clientHistory", params] as const,
};

export function clientWorkOrderHistoryQueryOptions({
  clientId,
  page,
}: ClientWorkOrderHistoryParams) {
  return queryOptions({
    queryKey: workOrderKeys.clientHistory({ clientId, page }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders", {
          params: {
            query: {
              clientId,
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
