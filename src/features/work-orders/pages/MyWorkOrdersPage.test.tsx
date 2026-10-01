import { screen } from "@testing-library/react";
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
  server.use(http.get(`${apiBaseUrl}/api/v1/work-orders`, () => HttpResponse.json(workOrderPage)));
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
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.queryByLabelText("Technik")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Technik" })).not.toBeInTheDocument();
    expect(userListRequests).toHaveLength(0);
  });

  it("explains that no work orders are assigned yet", async () => {
    mockWorkOrders([]);
    renderApp("/my-work-orders");

    expect(
      await screen.findByRole("heading", { name: "Nie masz przypisanych zleceń" }),
    ).toBeInTheDocument();
  });
});
