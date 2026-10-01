import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import {
  useCreateWorkOrderMutation,
  useUpdateWorkOrderMutation,
} from "@/features/work-orders/api/workOrderMutations";
import { workOrderKeys } from "@/features/work-orders/api/workOrderQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createWorkOrderResponse } from "@/test/workOrderFixtures";

type CreateWorkOrderRequest = components["schemas"]["CreateWorkOrderRequest"];
type UpdateWorkOrderRequest = components["schemas"]["UpdateWorkOrderRequest"];

const workOrder = createWorkOrderResponse();
const workOrdersUrl = `${apiBaseUrl}/api/v1/work-orders`;

function renderWithQueryClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, result: renderHook(hook, { wrapper }).result };
}

describe("useCreateWorkOrderMutation", () => {
  it("creates the work order and keeps its first version", async () => {
    const request: CreateWorkOrderRequest = {
      deviceId: workOrder.deviceId,
      description: workOrder.description,
      priority: "High",
      dueDate: "2026-10-20T08:00:00.000Z",
    };
    const receivedBodies: CreateWorkOrderRequest[] = [];
    server.use(
      http.post<never, CreateWorkOrderRequest>(workOrdersUrl, async ({ request: httpRequest }) => {
        receivedBodies.push(await httpRequest.json());
        return HttpResponse.json(workOrder, { status: 201, headers: { ETag: '"1"' } });
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useCreateWorkOrderMutation());

    await result.current.mutateAsync(request);

    expect(receivedBodies).toEqual([request]);
    expect(queryClient.getQueryData(workOrderKeys.detail(workOrder.id))).toEqual({
      data: workOrder,
      etag: '"1"',
    });
  });
});

describe("useUpdateWorkOrderMutation", () => {
  it("sends the edited version in If-Match and keeps the new version", async () => {
    const request: UpdateWorkOrderRequest = {
      description: "Kocioł wyłącza się po kilku minutach",
      priority: "Critical",
      dueDate: workOrder.dueDate,
    };
    const updatedWorkOrder = createWorkOrderResponse(request);
    const ifMatchHeaders: (string | null)[] = [];
    server.use(
      http.put(`${workOrdersUrl}/${workOrder.id}`, ({ request: httpRequest }) => {
        ifMatchHeaders.push(httpRequest.headers.get("If-Match"));
        return HttpResponse.json(updatedWorkOrder, { headers: { ETag: '"2"' } });
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useUpdateWorkOrderMutation());

    await result.current.mutateAsync({ workOrderId: workOrder.id, etag: '"1"', request });

    expect(ifMatchHeaders).toEqual(['"1"']);
    expect(queryClient.getQueryData(workOrderKeys.detail(workOrder.id))).toEqual({
      data: updatedWorkOrder,
      etag: '"2"',
    });
  });
});
