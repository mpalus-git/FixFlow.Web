import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap, unwrapVersioned } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const devicesPageSize = 10;
export const deviceListPageSize = 20;

export type ClientDeviceListParams = {
  clientId: string;
  page: number;
};

export type DeviceListParams = {
  page: number;
  search: string;
};

export const deviceKeys = {
  all: queryKeyRoots.devices,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: DeviceListParams) => [...deviceKeys.lists(), "all", params] as const,
  clientList: (params: ClientDeviceListParams) =>
    [...deviceKeys.lists(), "client", params] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (deviceId: string) => [...deviceKeys.details(), deviceId] as const,
};

export function deviceListQueryOptions({ page, search }: DeviceListParams) {
  return queryOptions({
    queryKey: deviceKeys.list({ page, search }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/devices", {
          params: {
            query: {
              page,
              pageSize: deviceListPageSize,
              ...(search === "" ? {} : { search }),
            },
          },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function clientDeviceListQueryOptions({ clientId, page }: ClientDeviceListParams) {
  return queryOptions({
    queryKey: deviceKeys.clientList({ clientId, page }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/devices", {
          params: { query: { clientId, page, pageSize: devicesPageSize } },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function deviceQueryOptions(deviceId: string) {
  return queryOptions({
    queryKey: deviceKeys.detail(deviceId),
    queryFn: async ({ signal }) =>
      unwrapVersioned(
        await apiClient.GET("/api/v1/devices/{deviceId}", {
          params: { path: { deviceId } },
          signal,
        }),
      ),
  });
}
