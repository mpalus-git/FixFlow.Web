import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import type { components } from "@/shared/api/schema";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];
type DashboardSummaryResponse = components["schemas"]["DashboardSummaryResponse"];

export const dashboardRefreshIntervalMs = 60_000;

export const dashboardKeys = {
  summary: () => [...queryKeyRoots.workOrders, "list", "dashboard"] as const,
};

export function dashboardSummaryQueryOptions() {
  return queryOptions({
    queryKey: dashboardKeys.summary(),
    queryFn: async ({ signal }) =>
      unwrap(await apiClient.GET("/api/v1/dashboard/summary", { signal })),
    refetchInterval: dashboardRefreshIntervalMs,
  });
}

export function statusCountOf(summary: DashboardSummaryResponse, status: WorkOrderStatus): number {
  return summary.statusCounts.find((statusCount) => statusCount.status === status)?.count ?? 0;
}
