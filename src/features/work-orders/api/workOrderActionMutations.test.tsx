import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import {
  useAssignTechnicianMutation,
  useChangeTechnicianMutation,
  useInvoiceWorkOrderMutation,
} from "@/features/work-orders/api/workOrderActionMutations";
import { workOrderKeys } from "@/features/work-orders/api/workOrderQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createWorkOrderResponse } from "@/test/workOrderFixtures";

type AssignTechnicianRequest = components["schemas"]["AssignTechnicianRequest"];

const newWorkOrder = createWorkOrderResponse({ status: "New", technicianId: null });
const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${newWorkOrder.id}`;
const technicianId = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

function renderWithQueryClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, result: renderHook(hook, { wrapper }).result };
}

function mockActions(assignResponse: () => Response) {
  const calls: string[] = [];
  server.use(
    http.post(`${workOrderUrl}/unassign`, () => {
      calls.push("unassign");
      return HttpResponse.json(newWorkOrder, { headers: { ETag: '"2"' } });
    }),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/assign`, async ({ request }) => {
      calls.push(`assign ${(await request.json()).technicianId}`);
      return assignResponse();
    }),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/reassign`, async ({ request }) => {
      calls.push(`reassign ${(await request.json()).technicianId}`);
      return assignResponse();
    }),
  );
  return calls;
}

function assignedResponse() {
  return HttpResponse.json(createWorkOrderResponse({ status: "Assigned", technicianId }), {
    headers: { ETag: '"3"' },
  });
}

describe("work order action mutations", () => {
  it("assigns the technician and keeps the new version of the work order", async () => {
    mockActions(assignedResponse);
    const { queryClient, result } = renderWithQueryClient(() => useAssignTechnicianMutation());

    await result.current.mutateAsync({ workOrderId: newWorkOrder.id, technicianId });

    expect(queryClient.getQueryData(workOrderKeys.detail(newWorkOrder.id))).toMatchObject({
      data: { status: "Assigned", technicianId },
      etag: '"3"',
    });
  });

  it("refreshes the history of changes after an action", async () => {
    mockActions(assignedResponse);
    const { queryClient, result } = renderWithQueryClient(() => useAssignTechnicianMutation());
    queryClient.setQueryData(workOrderKeys.events(newWorkOrder.id), []);

    await result.current.mutateAsync({ workOrderId: newWorkOrder.id, technicianId });

    expect(queryClient.getQueryState(workOrderKeys.events(newWorkOrder.id))?.isInvalidated).toBe(
      true,
    );
  });

  it("changes the technician in one request without unassigning first", async () => {
    const calls = mockActions(assignedResponse);
    const { queryClient, result } = renderWithQueryClient(() => useChangeTechnicianMutation());

    await result.current.mutateAsync({ workOrderId: newWorkOrder.id, technicianId });

    expect(calls).toEqual([`reassign ${technicianId}`]);
    expect(queryClient.getQueryData(workOrderKeys.detail(newWorkOrder.id))).toMatchObject({
      data: { status: "Assigned", technicianId },
      etag: '"3"',
    });
  });

  it("invoices a completed work order", async () => {
    server.use(
      http.post(`${workOrderUrl}/invoice`, () =>
        HttpResponse.json(createWorkOrderResponse({ status: "Invoiced" }), {
          headers: { ETag: '"9"' },
        }),
      ),
    );
    const { queryClient, result } = renderWithQueryClient(() => useInvoiceWorkOrderMutation());

    await result.current.mutateAsync(newWorkOrder.id);

    expect(queryClient.getQueryData(workOrderKeys.detail(newWorkOrder.id))).toMatchObject({
      data: { status: "Invoiced" },
      etag: '"9"',
    });
  });
});
