import type { components } from "@/shared/api/schema";
import {
  calendarDateOf,
  todayCalendarDate,
  weekDays,
  withCalendarDate,
} from "@/shared/lib/dateTime";

export type DispatchWorkOrder = components["schemas"]["WorkOrderListItemResponse"];
export type DispatchTechnician = components["schemas"]["UserResponse"];

export type DispatchTarget =
  { kind: "unassigned" } | { kind: "cell"; technicianId: string; day: string };

type DispatchRow = {
  technician: DispatchTechnician;
  workOrdersByDay: Record<string, DispatchWorkOrder[]>;
};

export type DispatchBoard = {
  days: string[];
  rows: DispatchRow[];
  unassigned: DispatchWorkOrder[];
};

export type DispatchMovePlan =
  | { kind: "assign"; technicianId: string; dueDate: string | null }
  | { kind: "reassign"; technicianId: string; dueDate: string | null }
  | { kind: "unassign" };

type DispatchBoardSource = {
  weekStart: string;
  weekWorkOrders: readonly DispatchWorkOrder[];
  unassignedWorkOrders: readonly DispatchWorkOrder[];
  technicians: readonly DispatchTechnician[];
};

function byDueDate(left: DispatchWorkOrder, right: DispatchWorkOrder): number {
  return Date.parse(left.dueDate) - Date.parse(right.dueDate);
}

export function buildDispatchBoard({
  weekStart,
  weekWorkOrders,
  unassignedWorkOrders,
  technicians,
}: DispatchBoardSource): DispatchBoard {
  const days = weekDays(weekStart);
  const assigned = weekWorkOrders.filter((workOrder) => workOrder.technicianId !== null);
  const rows = technicians
    .filter(
      (technician) =>
        technician.isActive ||
        assigned.some((workOrder) => workOrder.technicianId === technician.id),
    )
    .map((technician) => {
      const workOrdersByDay = Object.fromEntries(
        days.map((day) => [
          day,
          assigned
            .filter(
              (workOrder) =>
                workOrder.technicianId === technician.id &&
                calendarDateOf(workOrder.dueDate) === day,
            )
            .sort(byDueDate),
        ]),
      );
      return { technician, workOrdersByDay };
    });
  return { days, rows, unassigned: [...unassignedWorkOrders].sort(byDueDate) };
}

export function canDragWorkOrder(workOrder: DispatchWorkOrder): boolean {
  return workOrder.status === "New" || workOrder.status === "Assigned";
}

export function planDispatchMove(
  workOrder: DispatchWorkOrder,
  target: DispatchTarget,
): DispatchMovePlan | null {
  if (target.kind === "unassigned") {
    return workOrder.status === "Assigned" ? { kind: "unassign" } : null;
  }
  const dueDate =
    calendarDateOf(workOrder.dueDate) === target.day
      ? null
      : withCalendarDate(workOrder.dueDate, target.day);
  if (workOrder.status === "New") {
    return { kind: "assign", technicianId: target.technicianId, dueDate };
  }
  if (
    workOrder.status !== "Assigned" ||
    (workOrder.technicianId === target.technicianId && dueDate === null)
  ) {
    return null;
  }
  return { kind: "reassign", technicianId: target.technicianId, dueDate };
}

export function canDropWorkOrder(
  workOrder: DispatchWorkOrder,
  target: DispatchTarget,
  activeTechnicianIds: ReadonlySet<string>,
  now: Date = new Date(),
): boolean {
  if (!canDragWorkOrder(workOrder)) {
    return false;
  }
  if (target.kind === "cell") {
    if (!activeTechnicianIds.has(target.technicianId) || target.day < todayCalendarDate(now)) {
      return false;
    }
  }
  const plan = planDispatchMove(workOrder, target);
  if (plan === null) {
    return false;
  }
  return (
    plan.kind === "unassign" || plan.dueDate === null || Date.parse(plan.dueDate) > now.getTime()
  );
}
