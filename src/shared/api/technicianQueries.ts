import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

const technicianOptionsLimit = 100;

export function technicianOptionsQueryOptions() {
  return queryOptions({
    queryKey: [...queryKeyRoots.users, "technicianOptions"] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/users", {
          params: { query: { role: "Technician", pageSize: technicianOptionsLimit } },
          signal,
        }),
      ).items,
  });
}

export function activeTechnicianOptionsQueryOptions() {
  return queryOptions({
    queryKey: [...queryKeyRoots.users, "technicianOptions", "active"] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/users", {
          params: {
            query: { role: "Technician", isActive: true, pageSize: technicianOptionsLimit },
          },
          signal,
        }),
      ).items,
  });
}
