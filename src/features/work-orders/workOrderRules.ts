import type { components } from "@/shared/api/schema";
import type { Role } from "@/shared/session/currentUser";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

const editableStatuses: readonly WorkOrderStatus[] = ["New", "Assigned", "InProgress"];

export function canEditWorkOrder(status: WorkOrderStatus): boolean {
  return editableStatuses.includes(status);
}

export type WorkOrderActionAvailability = {
  assign: boolean;
  changeTechnician: boolean;
  unassign: boolean;
  complete: boolean;
  invoice: boolean;
};

export function availableWorkOrderActions(
  status: WorkOrderStatus,
  role: Role,
): WorkOrderActionAvailability {
  const canDispatch = role === "Admin" || role === "Dispatcher";
  return {
    assign: canDispatch && status === "New",
    changeTechnician: canDispatch && status === "Assigned",
    unassign: canDispatch && status === "Assigned",
    complete: canDispatch && status === "InProgress",
    invoice: canDispatch && status === "Completed",
  };
}
