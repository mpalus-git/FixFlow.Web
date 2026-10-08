import type { components } from "@/shared/api/schema";
import type { Role } from "@/shared/session/currentUser";

export type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

export const workOrderStatuses = [
  "New",
  "Assigned",
  "InProgress",
  "Completed",
  "Invoiced",
] as const satisfies readonly WorkOrderStatus[];

export const openWorkOrderStatuses = [
  "New",
  "Assigned",
  "InProgress",
] as const satisfies readonly WorkOrderStatus[];

export function orderedStatuses(values: readonly string[]): WorkOrderStatus[] {
  return workOrderStatuses.filter((status) => values.includes(status));
}

const editableStatuses: readonly WorkOrderStatus[] = openWorkOrderStatuses;

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
