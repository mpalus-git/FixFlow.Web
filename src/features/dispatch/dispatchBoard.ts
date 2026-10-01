import type { components } from "@/shared/api/schema";
import {
  calendarDateOf,
  todayCalendarDate,
  weekDays,
  withCalendarDate,
} from "@/shared/lib/dateTime";

export type DispatchWorkOrder = components["schemas"]["WorkOrderListItemResponse"];
type Technician = components["schemas"]["UserResponse"];

export type DispatchTarget =
  { kind: "unassigned" } | { kind: "cell"; technicianId: string; day: string };

export type DispatchRow = {
  technician: Technician;
  workOrdersByDay: Record<string, DispatchWorkOrder[]>;
};

export type DispatchBoard = {
  days: string[];
  rows: DispatchRow[];
  unassigned: DispatchWorkOrder[];
};

export type DispatchMovePlan = {
  dueDate: string | null;
  unassign: boolean;
  assignTo: string | null;
};

type DispatchBoardSource = {
  weekStart: string;
  weekWorkOrders: readonly DispatchWorkOrder[];
  unassignedWorkOrders: readonly DispatchWorkOrder[];
  technicians: readonly Technician[];
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
): DispatchMovePlan {
  if (target.kind === "unassigned") {
    return { dueDate: null, unassign: workOrder.status === "Assigned", assignTo: null };
  }
  const dueDate =
    calendarDateOf(workOrder.dueDate) === target.day
      ? null
      : withCalendarDate(workOrder.dueDate, target.day);
  const changesTechnician = workOrder.technicianId !== target.technicianId;
  return {
    dueDate,
    unassign: workOrder.status === "Assigned" && changesTechnician,
    assignTo: changesTechnician ? target.technicianId : null,
  };
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
  if (plan.dueDate !== null && Date.parse(plan.dueDate) <= now.getTime()) {
    return false;
  }
  return plan.dueDate !== null || plan.unassign || plan.assignTo !== null;
}
