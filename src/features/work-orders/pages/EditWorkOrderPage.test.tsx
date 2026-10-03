import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createWorkOrderListItem, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];
type UpdateWorkOrderRequest = components["schemas"]["UpdateWorkOrderRequest"];
type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const overdueWorkOrder = createWorkOrderResponse({
  status: "Assigned",
  dueDate: "2026-09-20T08:00:42.517Z",
  isOverdue: true,
});
const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${overdueWorkOrder.id}`;

function mockWorkOrderApi(initial: WorkOrderResponse, listItems: WorkOrderPage["items"] = []) {
  let current = { workOrder: initial, etag: '"1"' };
  const updates: { ifMatch: string | null; body: UpdateWorkOrderRequest }[] = [];
  const workOrderPage: WorkOrderPage = {
    items: listItems,
    page: 1,
    pageSize: 20,
    totalCount: listItems.length,
  };
  const userPage: UserPage = { items: [], page: 1, pageSize: 100, totalCount: 0 };
  server.use(
    http.get(workOrderUrl, () =>
      HttpResponse.json(current.workOrder, { headers: { ETag: current.etag } }),
    ),
    http.put<never, UpdateWorkOrderRequest>(workOrderUrl, async ({ request }) => {
      const body = await request.json();
      updates.push({ ifMatch: request.headers.get("If-Match"), body });
      current = { workOrder: { ...current.workOrder, ...body }, etag: '"2"' };
      return HttpResponse.json(current.workOrder, { headers: { ETag: current.etag } });
    }),
    http.get(`${workOrderUrl}/service-entries`, () => HttpResponse.json([])),
    http.get(`${apiBaseUrl}/api/v1/work-orders`, () => HttpResponse.json(workOrderPage)),
    http.get(`${apiBaseUrl}/api/v1/users`, () => HttpResponse.json(userPage)),
  );
  return {
    updates,
    replaceOnServer: (workOrder: WorkOrderResponse) => {
      current = { workOrder, etag: '"7"' };
    },
  };
}

describe("EditWorkOrderPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("saves the edited version, keeps an untouched overdue due date and opens the details", async () => {
    const { updates } = mockWorkOrderApi(overdueWorkOrder);
    const router = renderApp(`/work-orders/${overdueWorkOrder.id}/edit`);
    const user = userEvent.setup();

    expect(
      await screen.findByRole("link", { name: "SN-2024-0001 · Vitodens 200-W" }),
    ).toHaveAttribute("href", `/devices/${overdueWorkOrder.deviceId}`);
    await user.selectOptions(screen.getByLabelText("Priorytet"), "Krytyczny");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(await screen.findByText("Zapisano zmiany zlecenia.")).toBeInTheDocument();
    expect(updates).toEqual([
      {
        ifMatch: '"1"',
        body: {
          description: overdueWorkOrder.description,
          priority: "Critical",
          dueDate: "2026-09-20T08:00:42.517Z",
        },
      },
    ]);
    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe(`/work-orders/${overdueWorkOrder.id}`);
    });
  });

  it("loads the current version after a conflict instead of overwriting it", async () => {
    const { replaceOnServer } = mockWorkOrderApi(overdueWorkOrder);
    server.use(
      http.put(workOrderUrl, () => {
        const problem: ProblemDetails = { status: 412, title: "Precondition Failed" };
        return HttpResponse.json(problem, { status: 412 });
      }),
    );
    renderApp(`/work-orders/${overdueWorkOrder.id}/edit`);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Zapisz zmiany" }));
    replaceOnServer({
      ...overdueWorkOrder,
      description: "Opis zmieniony przez innego dyspozytora",
    });
    await user.click(await screen.findByRole("button", { name: "Wczytaj aktualną wersję" }));

    expect(await screen.findByLabelText("Opis usterki")).toHaveValue(
      "Opis zmieniony przez innego dyspozytora",
    );
  });

  it("explains that a completed work order can no longer be edited", async () => {
    mockWorkOrderApi({ ...overdueWorkOrder, status: "Completed" });
    renderApp(`/work-orders/${overdueWorkOrder.id}/edit`);

    expect(await screen.findByRole("note")).toHaveTextContent(
      "Zlecenie jest zakończone lub zafakturowane",
    );
    expect(screen.getByLabelText("Opis usterki")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zapisz zmiany" })).toBeDisabled();
  });

  it("opens the editor only for open work orders and returns to the filtered list", async () => {
    mockWorkOrderApi(overdueWorkOrder, [
      createWorkOrderListItem({ id: overdueWorkOrder.id, deviceSerialNumber: "SN-OPEN" }),
      createWorkOrderListItem({
        id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
        deviceSerialNumber: "SN-DONE",
        status: "Completed",
      }),
    ]);
    const router = renderApp("/work-orders?sort=Status");
    const user = userEvent.setup();

    const doneRow = (await screen.findByText("SN-DONE")).closest("tr");
    expect(
      within(doneRow ?? document.body).queryByRole("link", { name: /Edytuj zlecenie/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Edytuj zlecenie dla SN-OPEN" }));
    await user.click(await screen.findByRole("link", { name: "Anuluj" }));

    expect(router.state.location.pathname).toBe("/work-orders");
    expect(router.state.location.search).toBe("?sort=Status");
  });

  it("shows the not found page for a work order that does not exist", async () => {
    server.use(
      http.get(workOrderUrl, () => {
        const problem: ProblemDetails = { status: 404, title: "Not Found" };
        return HttpResponse.json(problem, { status: 404 });
      }),
    );
    renderApp(`/work-orders/${overdueWorkOrder.id}/edit`);

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
  });
});
