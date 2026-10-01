import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const selectionOptionsLimit = 100;

export function clientOptionsQueryOptions() {
  return queryOptions({
    queryKey: [...queryKeyRoots.clients, "list", "options"] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/clients", {
          params: { query: { pageSize: selectionOptionsLimit } },
          signal,
        }),
      ).items,
  });
}

export function deviceOptionsQueryOptions(clientId: string) {
  return queryOptions({
    queryKey: [...queryKeyRoots.devices, "list", "options", clientId] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/devices", {
          params: { query: { clientId, pageSize: selectionOptionsLimit } },
          signal,
        }),
      ).items,
    enabled: clientId !== "",
  });
}
