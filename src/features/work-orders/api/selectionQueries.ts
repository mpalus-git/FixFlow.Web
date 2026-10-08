import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

const selectionOptionsLimit = 20;

export function clientOptionsQueryOptions(search: string) {
  return queryOptions({
    queryKey: [...queryKeyRoots.clients, "list", "options", search] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/clients", {
          params: { query: { pageSize: selectionOptionsLimit, search } },
          signal,
        }),
      ).items,
  });
}

export function deviceOptionsQueryOptions(clientId: string, search: string) {
  return queryOptions({
    queryKey: [...queryKeyRoots.devices, "list", "options", clientId, search] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/devices", {
          params: { query: { clientId, pageSize: selectionOptionsLimit, search } },
          signal,
        }),
      ).items,
    enabled: clientId !== "",
  });
}

export function selectedClientQueryOptions(clientId: string, enabled: boolean) {
  return queryOptions({
    queryKey: [...queryKeyRoots.clients, "options", "selected", clientId] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/clients/{clientId}", {
          params: { path: { clientId } },
          signal,
        }),
      ),
    enabled: enabled && clientId !== "",
  });
}

export function selectedDeviceQueryOptions(deviceId: string, enabled: boolean) {
  return queryOptions({
    queryKey: [...queryKeyRoots.devices, "options", "selected", deviceId] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/devices/{deviceId}", {
          params: { path: { deviceId } },
          signal,
        }),
      ),
    enabled: enabled && deviceId !== "",
  });
}
