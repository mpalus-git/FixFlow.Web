import type { components } from "@/shared/api/schema";
import type { Role } from "@/shared/session/currentUser";

export type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

type WorkOrderEventResponse = components["schemas"]["WorkOrderEventResponse"];

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

export function latestAssignmentTime(events: readonly WorkOrderEventResponse[]): string | null {
  let latest: string | null = null;
  for (const event of events) {
    const isAssignment = event.type === "Assigned" || event.type === "Reassigned";
    if (isAssignment && (latest === null || Date.parse(event.occurredAt) > Date.parse(latest))) {
      latest = event.occurredAt;
    }
  }
  return latest;
}

export function hasSameStatuses(
  first: readonly WorkOrderStatus[],
  second: readonly WorkOrderStatus[],
): boolean {
  return first.length === second.length && first.every((status) => second.includes(status));
}

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
