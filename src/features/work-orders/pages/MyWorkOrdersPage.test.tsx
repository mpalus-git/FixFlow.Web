import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

function mockWorkOrders(items: WorkOrderPage["items"]) {
  const workOrderPage: WorkOrderPage = { items, page: 1, pageSize: 20, totalCount: items.length };
  const requestedStatuses: string[][] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/work-orders`, ({ request }) => {
      requestedStatuses.push(new URL(request.url).searchParams.getAll("status"));
      return HttpResponse.json(workOrderPage);
    }),
  );
  return requestedStatuses;
}

function trackUserListRequests() {
  const requests: Request[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/users`, ({ request }) => {
      requests.push(request);
      return HttpResponse.json(null, { status: 403 });
    }),
  );
  return requests;
}

describe("MyWorkOrdersPage", () => {
  beforeEach(() => {
    signInAs("Technician");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("lists the technician's work orders without the technician filter and column", async () => {
    mockWorkOrders([createWorkOrderListItem()]);
    const userListRequests = trackUserListRequests();
    renderApp("/my-work-orders");

    expect(await screen.findByRole("cell", { name: "Piekarnia Kowalski" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Technik")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Technik" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Edytuj zlecenie/ })).not.toBeInTheDocument();
    expect(userListRequests).toHaveLength(0);
  });

  it("shows only open work orders by default and all of them after turning the toggle off", async () => {
    const requestedStatuses = mockWorkOrders([createWorkOrderListItem()]);
    const user = userEvent.setup();
    const router = renderApp("/my-work-orders");

    const openOnly = await screen.findByRole("button", { name: "Tylko otwarte" });
    expect(openOnly).toHaveAttribute("aria-pressed", "true");
    expect(requestedStatuses[0]).toEqual(["New", "Assigned", "InProgress"]);
    expect(screen.queryByRole("button", { name: "Wyczyść filtry" })).not.toBeInTheDocument();
    await user.click(openOnly);

    await vi.waitFor(() => {
      expect(router.state.location.search).toBe("?status=all");
    });
    await vi.waitFor(() => {
      expect(requestedStatuses.at(-1)).toEqual([]);
    });
    expect(screen.getByRole("button", { name: "Tylko otwarte" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("explains that the technician has no open work orders", async () => {
    mockWorkOrders([]);
    renderApp("/my-work-orders");

    expect(
      await screen.findByRole("heading", { name: "Nie masz otwartych zleceń" }),
    ).toBeInTheDocument();
  });

  it("explains that no work orders are assigned yet when all statuses are shown", async () => {
    const requestedStatuses = mockWorkOrders([]);
    renderApp("/my-work-orders?status=all");

    expect(
      await screen.findByRole("heading", { name: "Nie masz przypisanych zleceń" }),
    ).toBeInTheDocument();
    expect(requestedStatuses[0]).toEqual([]);
  });
});
