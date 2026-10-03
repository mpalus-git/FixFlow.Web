import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { dispatchKeys } from "@/features/dispatch/api/dispatchQueries";
import {
  StaleDispatchBoardError,
  useMoveWorkOrderMutation,
} from "@/features/dispatch/api/useMoveWorkOrderMutation";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createWorkOrderListItem, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type AssignTechnicianRequest = components["schemas"]["AssignTechnicianRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const weekStart = "2026-09-28";
const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const newOrder = createWorkOrderListItem({
  status: "New",
  technicianId: null,
  technicianEmail: null,
  technicianName: null,
  dueDate: "2026-09-29T08:00:00Z",
});
const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${newOrder.id}`;

function pageOf(items: WorkOrderPage["items"]): WorkOrderPage {
  return { items, page: 1, pageSize: 100, totalCount: items.length };
}

function problem(status: number, errorCode: string) {
  const body: ProblemDetails = { status, title: errorCode, errorCode };
  return HttpResponse.json(body, { status });
}

function setUp({
  current = createWorkOrderResponse({ status: "New", dueDate: newOrder.dueDate }),
  assign = () => HttpResponse.json(current, { headers: { ETag: '"3"' } }),
}: {
  current?: components["schemas"]["WorkOrderResponse"];
  assign?: () => Response;
} = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(dispatchKeys.week(weekStart), pageOf([newOrder]));
  queryClient.setQueryData(dispatchKeys.unassigned(), pageOf([newOrder]));
  const calls: string[] = [];
  const boardDuringAssign: (WorkOrderPage | undefined)[] = [];
  server.use(
    http.get(workOrderUrl, () => HttpResponse.json(current, { headers: { ETag: '"1"' } })),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/assign`, async ({ request }) => {
      const body = await request.json();
      calls.push([`assign ${body.technicianId}`, body.dueDate].filter(Boolean).join(" "));
      boardDuringAssign.push(queryClient.getQueryData(dispatchKeys.week(weekStart)));
      return assign();
    }),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useMoveWorkOrderMutation(), { wrapper });
  const move = (day: string) =>
    result.current.mutateAsync({
      workOrder: newOrder,
      target: { kind: "cell", technicianId: anna, day },
      technician: {
        id: anna,
        email: "anna@fixflow.test",
        fullName: "Anna Nowak",
        role: "Technician",
        isActive: true,
      },
      weekStart,
    });
  return { queryClient, calls, boardDuringAssign, move };
}

describe("useMoveWorkOrderMutation", () => {
  it("assigns a new work order and changes its due date in one request", async () => {
    const { calls, move } = setUp();

    await move("2026-10-01");

    expect(calls).toEqual([`assign ${anna} 2026-10-01T08:00:00.000Z`]);
  });

  it("shows the work order in the technician cell before the server answers", async () => {
    const { boardDuringAssign, queryClient, move } = setUp();

    await move("2026-09-29");

    expect(boardDuringAssign[0]?.items).toEqual([
      {
        ...newOrder,
        status: "Assigned",
        technicianId: anna,
        technicianEmail: "anna@fixflow.test",
        technicianName: "Anna Nowak",
      },
    ]);
    expect(queryClient.getQueryData(dispatchKeys.unassigned())).toEqual(pageOf([]));
  });

  it("restores the board when the server rejects the move", async () => {
    const { queryClient, move } = setUp({
      assign: () => problem(409, "WorkOrder.InvalidStatusTransition"),
    });

    await expect(move("2026-09-29")).rejects.toBeInstanceOf(ApiError);

    expect(queryClient.getQueryData(dispatchKeys.week(weekStart))).toEqual(pageOf([newOrder]));
    expect(queryClient.getQueryData(dispatchKeys.unassigned())).toEqual(pageOf([newOrder]));
  });

  it("changes nothing when the work order changed after the board was loaded", async () => {
    const { calls, move } = setUp({
      current: createWorkOrderResponse({ status: "Assigned", technicianId: anna }),
    });

    await expect(move("2026-10-01")).rejects.toBeInstanceOf(StaleDispatchBoardError);

    expect(calls).toEqual([]);
  });
});
