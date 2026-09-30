import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const devicesPageSize = 10;

export type ClientDeviceListParams = {
  clientId: string;
  page: number;
};

export const deviceKeys = {
  all: queryKeyRoots.devices,
  lists: () => [...deviceKeys.all, "list"] as const,
  clientList: (params: ClientDeviceListParams) => [...deviceKeys.lists(), params] as const,
};

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
