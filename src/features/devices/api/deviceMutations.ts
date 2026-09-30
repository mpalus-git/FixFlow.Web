import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceKeys } from "@/features/devices/api/deviceQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrapVersioned } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";

type CreateDeviceRequest = components["schemas"]["CreateDeviceRequest"];
type UpdateDeviceRequest = components["schemas"]["UpdateDeviceRequest"];
type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];

export type UpdateDeviceVariables = {
  deviceId: string;
  etag: string;
  request: UpdateDeviceRequest;
};

export function useCreateDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateDeviceRequest) =>
      unwrapVersioned(await apiClient.POST("/api/v1/devices", { body: request })),
    onSuccess: async (versionedDevice) => {
      queryClient.setQueryData(deviceKeys.detail(versionedDevice.data.id), versionedDevice);
      await queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}

export function useUpdateDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, etag, request }: UpdateDeviceVariables) =>
      unwrapVersioned(
        await apiClient.PUT("/api/v1/devices/{deviceId}", {
          params: { path: { deviceId }, header: { "If-Match": etag } },
          body: request,
        }),
      ),
    onSuccess: async (versionedDevice, { deviceId }) => {
      queryClient.setQueryData(deviceKeys.detail(deviceId), versionedDevice);
      await queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}

function withoutDevice(devicePage: DevicePage | undefined, deviceId: string) {
  if (devicePage === undefined) {
    return undefined;
  }
  const items = devicePage.items.filter((device) => device.id !== deviceId);
  const removedCount = devicePage.items.length - items.length;
  return { ...devicePage, items, totalCount: devicePage.totalCount - removedCount };
}

export function useArchiveDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      await apiClient.POST("/api/v1/devices/{deviceId}/archive", {
        params: { path: { deviceId } },
      });
    },
    onMutate: async (deviceId) => {
      await queryClient.cancelQueries({ queryKey: deviceKeys.lists() });
      const previousPages = queryClient.getQueriesData<DevicePage>({
        queryKey: deviceKeys.lists(),
      });
      queryClient.setQueriesData<DevicePage>({ queryKey: deviceKeys.lists() }, (devicePage) =>
        withoutDevice(devicePage, deviceId),
      );
      return { previousPages };
    },
    onError: (_error, _deviceId, context) => {
      for (const [queryKey, devicePage] of context?.previousPages ?? []) {
        queryClient.setQueryData(queryKey, devicePage);
      }
    },
    onSettled: async (_data, _error, deviceId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: deviceKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: deviceKeys.detail(deviceId) }),
      ]);
    },
  });
}
