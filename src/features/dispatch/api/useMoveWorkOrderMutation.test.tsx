import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { dispatchKeys } from "@/features/dispatch/api/dispatchQueries";
import {
  StaleDispatchBoardError,
  useMoveWorkOrderMutation,
} from "@/features/dispatch/api/useMoveWorkOrderMutation";
import type {
  DispatchTarget,
  DispatchTechnician,
  DispatchWorkOrder,
} from "@/features/dispatch/dispatchBoard";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createWorkOrderListItem, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];
type ReassignTechnicianRequest = components["schemas"]["ReassignTechnicianRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const weekStart = "2026-09-28";
const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const piotr = "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e";
const annaUser: DispatchTechnician = {
  id: anna,
  email: "anna@fixflow.test",
  fullName: "Anna Nowak",
  role: "Technician",
  isActive: true,
};
const piotrUser: DispatchTechnician = {
  ...annaUser,
  id: piotr,
  email: "piotr@fixflow.test",
  fullName: "Piotr Zieliński",
};
const newOrder = createWorkOrderListItem({
  status: "New",
  technicianId: null,
  technicianEmail: null,
  technicianName: null,
  dueDate: "2026-09-29T08:00:00Z",
});
const assignedToAnna = createWorkOrderListItem({
  status: "Assigned",
  technicianId: anna,
  technicianEmail: annaUser.email,
  technicianName: annaUser.fullName,
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

function responseFor(workOrder: DispatchWorkOrder): WorkOrderResponse {
  return createWorkOrderResponse({
    status: workOrder.status,
    technicianId: workOrder.technicianId,
    dueDate: workOrder.dueDate,
  });
}

function setUp({
  workOrder = newOrder,
  current = responseFor(workOrder),
  respond = () => HttpResponse.json(current, { headers: { ETag: '"2"' } }),
}: {
  workOrder?: DispatchWorkOrder;
  current?: WorkOrderResponse;
  respond?: () => Response;
} = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(dispatchKeys.week(weekStart), pageOf([workOrder]));
  queryClient.setQueryData(
    dispatchKeys.unassigned(),
    pageOf(workOrder.status === "New" ? [workOrder] : []),
  );
  const calls: string[] = [];
  const boardDuringRequest: (WorkOrderPage | undefined)[] = [];
  const record = (action: string, body: Partial<ReassignTechnicianRequest>) => {
    calls.push([action, body.technicianId, body.dueDate].filter(Boolean).join(" "));
    boardDuringRequest.push(queryClient.getQueryData(dispatchKeys.week(weekStart)));
    return respond();
  };
  server.use(
    http.get(workOrderUrl, () => HttpResponse.json(current, { headers: { ETag: '"1"' } })),
    http.post<never, ReassignTechnicianRequest>(`${workOrderUrl}/assign`, async ({ request }) =>
      record("assign", await request.json()),
    ),
    http.post<never, ReassignTechnicianRequest>(`${workOrderUrl}/reassign`, async ({ request }) =>
      record("reassign", await request.json()),
    ),
    http.post(`${workOrderUrl}/unassign`, () => record("unassign", {})),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useMoveWorkOrderMutation(), { wrapper });
  const move = (target: DispatchTarget, technician: DispatchTechnician | null = annaUser) =>
    result.current.mutateAsync({ workOrder, target, technician, weekStart });
  return { queryClient, calls, boardDuringRequest, move };
}

describe("useMoveWorkOrderMutation", () => {
  it("assigns a new work order and changes its due date in one request", async () => {
    const { calls, move } = setUp();

    await move({ kind: "cell", technicianId: anna, day: "2026-10-01" });

    expect(calls).toEqual([`assign ${anna} 2026-10-01T08:00:00.000Z`]);
  });

  it("assigns a new work order without a due date when it stays on its day", async () => {
    const { calls, move } = setUp();

    await move({ kind: "cell", technicianId: anna, day: "2026-09-29" });

    expect(calls).toEqual([`assign ${anna}`]);
  });

  it("moves an assigned work order to another technician and day in one request", async () => {
    const { calls, move } = setUp({ workOrder: assignedToAnna });

    await move({ kind: "cell", technicianId: piotr, day: "2026-10-02" }, piotrUser);

    expect(calls).toEqual([`reassign ${piotr} 2026-10-02T08:00:00.000Z`]);
  });

  it("unassigns an assigned work order dropped on the unassigned column", async () => {
    const { calls, queryClient, move } = setUp({ workOrder: assignedToAnna });

    await move({ kind: "unassigned" }, null);

    expect(calls).toEqual(["unassign"]);
    expect(queryClient.getQueryData<WorkOrderPage>(dispatchKeys.unassigned())?.items).toEqual([
      {
        ...assignedToAnna,
        status: "New",
        technicianId: null,
        technicianEmail: null,
        technicianName: null,
      },
    ]);
  });

  it("shows the work order in the technician cell before the server answers", async () => {
    const { boardDuringRequest, queryClient, move } = setUp();

    await move({ kind: "cell", technicianId: anna, day: "2026-09-29" });

    expect(boardDuringRequest[0]?.items).toEqual([
      {
        ...newOrder,
        status: "Assigned",
        technicianId: anna,
        technicianEmail: annaUser.email,
        technicianName: annaUser.fullName,
      },
    ]);
    expect(queryClient.getQueryData(dispatchKeys.unassigned())).toEqual(pageOf([]));
  });

  it("restores the board when the server rejects the move", async () => {
    const { queryClient, move } = setUp({
      respond: () => problem(409, "WorkOrder.InvalidStatusTransition"),
    });

    await expect(
      move({ kind: "cell", technicianId: anna, day: "2026-09-29" }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(queryClient.getQueryData(dispatchKeys.week(weekStart))).toEqual(pageOf([newOrder]));
    expect(queryClient.getQueryData(dispatchKeys.unassigned())).toEqual(pageOf([newOrder]));
  });

  it("changes nothing when the work order changed after the board was loaded", async () => {
    const { calls, move } = setUp({
      current: createWorkOrderResponse({ status: "Assigned", technicianId: anna }),
    });

    await expect(
      move({ kind: "cell", technicianId: anna, day: "2026-10-01" }),
    ).rejects.toBeInstanceOf(StaleDispatchBoardError);

    expect(calls).toEqual([]);
  });
});
