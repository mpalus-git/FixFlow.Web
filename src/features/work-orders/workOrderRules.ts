import type { components } from "@/shared/api/schema";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

const editableStatuses: readonly WorkOrderStatus[] = ["New", "Assigned", "InProgress"];

export function canEditWorkOrder(status: WorkOrderStatus): boolean {
  return editableStatuses.includes(status);
}
