import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import { addCalendarDays } from "@/shared/lib/dateTime";

export const dispatchBoardLimit = 100;

export const dispatchRefreshIntervalMs = 30_000;

export const dispatchKeys = {
  all: [...queryKeyRoots.workOrders, "list", "dispatch"] as const,
  week: (weekStart: string) => [...dispatchKeys.all, "week", weekStart] as const,
  unassigned: () => [...dispatchKeys.all, "unassigned"] as const,
  move: () => [...dispatchKeys.all, "move"] as const,
};

export function weekWorkOrdersQueryOptions(weekStart: string) {
  return queryOptions({
    queryKey: dispatchKeys.week(weekStart),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders", {
          params: {
            query: {
              dueFrom: weekStart,
              dueTo: addCalendarDays(weekStart, 6),
              page: 1,
              pageSize: dispatchBoardLimit,
              sortBy: "DueDate",
              sortDirection: "Asc",
            },
          },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function unassignedWorkOrdersQueryOptions() {
  return queryOptions({
    queryKey: dispatchKeys.unassigned(),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders", {
          params: {
            query: {
              status: ["New"],
              page: 1,
              pageSize: dispatchBoardLimit,
              sortBy: "DueDate",
              sortDirection: "Asc",
            },
          },
          signal,
        }),
      ),
  });
}
