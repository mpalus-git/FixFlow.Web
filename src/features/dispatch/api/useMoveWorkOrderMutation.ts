import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { dispatchKeys } from "@/features/dispatch/api/dispatchQueries";
import {
  type DispatchMovePlan,
  type DispatchTarget,
  type DispatchWorkOrder,
  planDispatchMove,
} from "@/features/dispatch/dispatchBoard";
import { apiClient } from "@/shared/api/apiClient";
import { unwrapVersioned } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import type { components } from "@/shared/api/schema";
import { calendarDateOf, weekDays } from "@/shared/lib/dateTime";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

export type MoveWorkOrderVariables = {
  workOrder: DispatchWorkOrder;
  target: DispatchTarget;
  technicianEmail: string | null;
  weekStart: string;
};

export class StaleDispatchBoardError extends Error {
  constructor() {
    super("The work order changed after the board was loaded.");
    this.name = "StaleDispatchBoardError";
  }
}

export class PartialDispatchMoveError extends Error {
  constructor(cause: unknown) {
    super("The work order was changed only partially.", { cause });
    this.name = "PartialDispatchMoveError";
  }
}

type BoardSnapshot = {
  week: WorkOrderPage | undefined;
  unassigned: WorkOrderPage | undefined;
};

async function loadCurrentVersion(workOrder: DispatchWorkOrder) {
  const current = unwrapVersioned(
    await apiClient.GET("/api/v1/work-orders/{workOrderId}", {
      params: { path: { workOrderId: workOrder.id } },
    }),
  );
  if (
    current.data.status !== workOrder.status ||
    current.data.technicianId !== workOrder.technicianId ||
    Date.parse(current.data.dueDate) !== Date.parse(workOrder.dueDate)
  ) {
    throw new StaleDispatchBoardError();
  }
  return current;
}

async function applyPlan(workOrder: DispatchWorkOrder, plan: DispatchMovePlan) {
  const current = await loadCurrentVersion(workOrder);
  const workOrderId = workOrder.id;
  let changed = false;
  try {
    if (plan.dueDate !== null) {
      await apiClient.PUT("/api/v1/work-orders/{workOrderId}", {
        params: { path: { workOrderId }, header: { "If-Match": current.etag } },
        body: {
          description: current.data.description,
          priority: current.data.priority,
          dueDate: plan.dueDate,
        },
      });
      changed = true;
    }
    if (plan.unassign) {
      await apiClient.POST("/api/v1/work-orders/{workOrderId}/unassign", {
        params: { path: { workOrderId } },
      });
      changed = true;
    }
    if (plan.assignTo !== null) {
      await apiClient.POST("/api/v1/work-orders/{workOrderId}/assign", {
        params: { path: { workOrderId } },
        body: { technicianId: plan.assignTo },
      });
    }
  } catch (error) {
    throw changed ? new PartialDispatchMoveError(error) : error;
  }
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
  { workOrder, target, technicianEmail }: MoveWorkOrderVariables,
  plan: DispatchMovePlan,
): DispatchWorkOrder {
  const assigned = target.kind === "cell";
  return {
    ...workOrder,
    status: assigned ? "Assigned" : "New",
    technicianId: assigned ? target.technicianId : null,
    technicianEmail: assigned ? technicianEmail : null,
    dueDate: plan.dueDate ?? workOrder.dueDate,
    isOverdue: plan.dueDate === null ? workOrder.isOverdue : false,
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
