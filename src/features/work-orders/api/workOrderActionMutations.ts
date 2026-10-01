import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { workOrderKeys } from "@/features/work-orders/api/workOrderQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrapVersioned, type Versioned } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];

export type TechnicianAssignment = {
  workOrderId: string;
  technicianId: string;
};

export class PartialTechnicianChangeError extends Error {
  constructor(cause: unknown) {
    super("The technician was unassigned, but the new one could not be assigned.", { cause });
    this.name = "PartialTechnicianChangeError";
  }
}

async function storeVersion(queryClient: QueryClient, version: Versioned<WorkOrderResponse>) {
  queryClient.setQueryData(workOrderKeys.detail(version.data.id), version);
  await queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
}

async function reloadWorkOrder(queryClient: QueryClient, workOrderId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) }),
    queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() }),
  ]);
}

async function assign({ workOrderId, technicianId }: TechnicianAssignment) {
  return unwrapVersioned(
    await apiClient.POST("/api/v1/work-orders/{workOrderId}/assign", {
      params: { path: { workOrderId } },
      body: { technicianId },
    }),
  );
}

async function unassign(workOrderId: string) {
  return unwrapVersioned(
    await apiClient.POST("/api/v1/work-orders/{workOrderId}/unassign", {
      params: { path: { workOrderId } },
    }),
  );
}

export function useAssignTechnicianMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assign,
    onSuccess: (version) => storeVersion(queryClient, version),
    onError: (_error, { workOrderId }) => reloadWorkOrder(queryClient, workOrderId),
  });
}

export function useUnassignTechnicianMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unassign,
    onSuccess: (version) => storeVersion(queryClient, version),
    onError: (_error, workOrderId) => reloadWorkOrder(queryClient, workOrderId),
  });
}

export function useChangeTechnicianMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: TechnicianAssignment) => {
      await storeVersion(queryClient, await unassign(assignment.workOrderId));
      try {
        return await assign(assignment);
      } catch (error) {
        throw new PartialTechnicianChangeError(error);
      }
    },
    onSuccess: (version) => storeVersion(queryClient, version),
    onError: (_error, { workOrderId }) => reloadWorkOrder(queryClient, workOrderId),
  });
}

export function useCompleteWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workOrderId: string) =>
      unwrapVersioned(
        await apiClient.POST("/api/v1/work-orders/{workOrderId}/complete", {
          params: { path: { workOrderId } },
        }),
      ),
    onSuccess: (version) => storeVersion(queryClient, version),
    onError: (_error, workOrderId) => reloadWorkOrder(queryClient, workOrderId),
  });
}

export function useInvoiceWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workOrderId: string) =>
      unwrapVersioned(
        await apiClient.POST("/api/v1/work-orders/{workOrderId}/invoice", {
          params: { path: { workOrderId } },
        }),
      ),
    onSuccess: (version) => storeVersion(queryClient, version),
    onError: (_error, workOrderId) => reloadWorkOrder(queryClient, workOrderId),
  });
}
