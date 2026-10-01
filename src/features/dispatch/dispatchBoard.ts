import type { components } from "@/shared/api/schema";
import { calendarDateOf, weekDays } from "@/shared/lib/dateTime";

export type DispatchWorkOrder = components["schemas"]["WorkOrderListItemResponse"];
type Technician = components["schemas"]["UserResponse"];

export type DispatchRow = {
  technician: Technician;
  workOrdersByDay: Record<string, DispatchWorkOrder[]>;
};

export type DispatchBoard = {
  days: string[];
  rows: DispatchRow[];
  unassigned: DispatchWorkOrder[];
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
