import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workOrderKeys } from "@/features/work-orders/api/workOrderQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrapVersioned } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";

type CreateWorkOrderRequest = components["schemas"]["CreateWorkOrderRequest"];
type UpdateWorkOrderRequest = components["schemas"]["UpdateWorkOrderRequest"];

export type UpdateWorkOrderVariables = {
  workOrderId: string;
  etag: string;
  request: UpdateWorkOrderRequest;
};

export function useCreateWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateWorkOrderRequest) =>
      unwrapVersioned(await apiClient.POST("/api/v1/work-orders", { body: request })),
    onSuccess: async (versionedWorkOrder) => {
      queryClient.setQueryData(
        workOrderKeys.detail(versionedWorkOrder.data.id),
        versionedWorkOrder,
      );
      await queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useUpdateWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workOrderId, etag, request }: UpdateWorkOrderVariables) =>
      unwrapVersioned(
        await apiClient.PUT("/api/v1/work-orders/{workOrderId}", {
          params: { path: { workOrderId }, header: { "If-Match": etag } },
          body: request,
        }),
      ),
    onSuccess: async (versionedWorkOrder, { workOrderId }) => {
      queryClient.setQueryData(workOrderKeys.detail(workOrderId), versionedWorkOrder);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: workOrderKeys.events(workOrderId) }),
      ]);
    },
  });
}
