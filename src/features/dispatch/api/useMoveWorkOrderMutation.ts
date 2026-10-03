import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { dispatchKeys } from "@/features/dispatch/api/dispatchQueries";
import {
  type DispatchMovePlan,
  type DispatchTarget,
  type DispatchTechnician,
  type DispatchWorkOrder,
  planDispatchMove,
} from "@/features/dispatch/dispatchBoard";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import type { components } from "@/shared/api/schema";
import { calendarDateOf, weekDays } from "@/shared/lib/dateTime";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

export type MoveWorkOrderVariables = {
  workOrder: DispatchWorkOrder;
  target: DispatchTarget;
  technician: DispatchTechnician | null;
  weekStart: string;
};

export class StaleDispatchBoardError extends Error {
  constructor() {
    super("The work order changed after the board was loaded.");
    this.name = "StaleDispatchBoardError";
  }
}

type BoardSnapshot = {
  week: WorkOrderPage | undefined;
  unassigned: WorkOrderPage | undefined;
};

async function ensureBoardIsCurrent(workOrder: DispatchWorkOrder) {
  const current = unwrap(
    await apiClient.GET("/api/v1/work-orders/{workOrderId}", {
      params: { path: { workOrderId: workOrder.id } },
    }),
  );
  if (
    current.status !== workOrder.status ||
    current.technicianId !== workOrder.technicianId ||
    Date.parse(current.dueDate) !== Date.parse(workOrder.dueDate)
  ) {
    throw new StaleDispatchBoardError();
  }
}

async function applyPlan(workOrder: DispatchWorkOrder, plan: DispatchMovePlan | null) {
  if (plan === null) {
    return;
  }
  await ensureBoardIsCurrent(workOrder);
  const path = { workOrderId: workOrder.id };
  if (plan.kind === "unassign") {
    await apiClient.POST("/api/v1/work-orders/{workOrderId}/unassign", { params: { path } });
    return;
  }
  const body =
    plan.dueDate === null
      ? { technicianId: plan.technicianId }
      : { technicianId: plan.technicianId, dueDate: plan.dueDate };
  await (plan.kind === "assign"
    ? apiClient.POST("/api/v1/work-orders/{workOrderId}/assign", { params: { path }, body })
    : apiClient.POST("/api/v1/work-orders/{workOrderId}/reassign", { params: { path }, body }));
}

function replaceOrRemove(
  page: WorkOrderPage | undefined,
  workOrder: DispatchWorkOrder,
  keep: boolean,
): WorkOrderPage | undefined {
  if (page === undefined) {
    return page;
  }
  const others = page.items.filter((item) => item.id !== workOrder.id);
  const items = keep ? [...others, workOrder] : others;
  return { ...page, items, totalCount: page.totalCount + items.length - page.items.length };
}

function movedWorkOrder(
  { workOrder, target, technician }: MoveWorkOrderVariables,
  plan: DispatchMovePlan | null,
): DispatchWorkOrder {
  const dueDate = plan === null || plan.kind === "unassign" ? null : plan.dueDate;
  const assigned = target.kind === "cell" && technician !== null;
  return {
    ...workOrder,
    status: assigned ? "Assigned" : "New",
    technicianId: assigned ? target.technicianId : null,
    technicianEmail: assigned ? technician.email : null,
    technicianName: assigned ? technician.fullName : null,
    dueDate: dueDate ?? workOrder.dueDate,
    isOverdue: dueDate === null ? workOrder.isOverdue : false,
  };
}

async function moveOnBoard(
  queryClient: QueryClient,
  variables: MoveWorkOrderVariables,
): Promise<BoardSnapshot> {
  await queryClient.cancelQueries({ queryKey: dispatchKeys.all });
  const weekKey = dispatchKeys.week(variables.weekStart);
  const unassignedKey = dispatchKeys.unassigned();
  const snapshot: BoardSnapshot = {
    week: queryClient.getQueryData<WorkOrderPage>(weekKey),
    unassigned: queryClient.getQueryData<WorkOrderPage>(unassignedKey),
  };
  const moved = movedWorkOrder(variables, planDispatchMove(variables.workOrder, variables.target));
  const inWeek = weekDays(variables.weekStart).includes(calendarDateOf(moved.dueDate));
  queryClient.setQueryData(weekKey, replaceOrRemove(snapshot.week, moved, inWeek));
  queryClient.setQueryData(
    unassignedKey,
    replaceOrRemove(snapshot.unassigned, moved, moved.status === "New"),
  );
  return snapshot;
}

export function useMoveWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrder, target }: MoveWorkOrderVariables) =>
      applyPlan(workOrder, planDispatchMove(workOrder, target)),
    onMutate: (variables) => moveOnBoard(queryClient, variables),
    onError: (_error, { weekStart }, snapshot) => {
      if (snapshot !== undefined) {
        queryClient.setQueryData(dispatchKeys.week(weekStart), snapshot.week);
        queryClient.setQueryData(dispatchKeys.unassigned(), snapshot.unassigned);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeyRoots.workOrders }),
  });
}
