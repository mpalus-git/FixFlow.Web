import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { dispatchKeys } from "@/features/dispatch/api/dispatchQueries";
import { useMoveWorkOrderMutation } from "@/features/dispatch/api/useMoveWorkOrderMutation";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createWorkOrderListItem, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type UpdateWorkOrderRequest = components["schemas"]["UpdateWorkOrderRequest"];
type AssignTechnicianRequest = components["schemas"]["AssignTechnicianRequest"];

const weekStart = "2026-09-28";
const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const newOrder = createWorkOrderListItem({
  status: "New",
  technicianId: null,
  technicianEmail: null,
  dueDate: "2026-09-29T08:00:00Z",
});
const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${newOrder.id}`;

function pageOf(items: WorkOrderPage["items"]): WorkOrderPage {
  return { items, page: 1, pageSize: 100, totalCount: items.length };
}

function setUp({
  current = createWorkOrderResponse({ status: "New", dueDate: newOrder.dueDate }),
  update = () => HttpResponse.json(current, { headers: { ETag: '"2"' } }),
  assign = () => HttpResponse.json(current, { headers: { ETag: '"3"' } }),
}: {
  current?: components["schemas"]["WorkOrderResponse"];
  update?: () => Response;
  assign?: () => Response;
} = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(dispatchKeys.week(weekStart), pageOf([newOrder]));
  queryClient.setQueryData(dispatchKeys.unassigned(), pageOf([newOrder]));
  const calls: string[] = [];
  const boardDuringAssign: (WorkOrderPage | undefined)[] = [];
  server.use(
    http.get(workOrderUrl, () => HttpResponse.json(current, { headers: { ETag: '"1"' } })),
    http.put<never, UpdateWorkOrderRequest>(workOrderUrl, async ({ request }) => {
      const body = await request.json();
      calls.push(`put ${request.headers.get("If-Match") ?? ""} ${body.dueDate}`);
      return update();
    }),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/assign`, async ({ request }) => {
      calls.push(`assign ${(await request.json()).technicianId}`);
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
      technicianEmail: "anna@fixflow.test",
      weekStart,
    });
  return { queryClient, calls, boardDuringAssign, move };
}

describe("useMoveWorkOrderMutation", () => {
  it("changes the due date with If-Match before assigning the technician", async () => {
    const { calls, move } = setUp();

    await move("2026-10-01");

    expect(calls).toEqual(['put "1" 2026-10-01T08:00:00.000Z', `assign ${anna}`]);
  });

  it("shows the work order in the technician cell before the server answers", async () => {
    const { boardDuringAssign, queryClient, move } = setUp();

    await move("2026-09-29");

    expect(boardDuringAssign[0]?.items).toEqual([
      { ...newOrder, status: "Assigned", technicianId: anna, technicianEmail: "anna@fixflow.test" },
    ]);
    expect(queryClient.getQueryData(dispatchKeys.unassigned())).toEqual(pageOf([]));
  });
});
