import { screen, within } from "@testing-library/react";
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
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];

const workOrdersUrl = `${apiBaseUrl}/api/v1/work-orders`;

function mockWorkOrders(totalCount: number) {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(workOrdersUrl, ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      requests.push(searchParams);
      const workOrderPage: WorkOrderPage = {
        items: totalCount === 0 ? [] : [createWorkOrderListItem()],
        page: Number(searchParams.get("page")),
        pageSize: 20,
        totalCount,
      };
      return HttpResponse.json(workOrderPage);
    }),
  );
  return requests;
}

describe("WorkOrdersPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
    const userPage: UserPage = { items: [], page: 1, pageSize: 100, totalCount: 0 };
    server.use(http.get(`${apiBaseUrl}/api/v1/users`, () => HttpResponse.json(userPage)));
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("lists work orders by due date from the navigation entry", async () => {
    const requests = mockWorkOrders(1);
    renderApp("/work-orders");

    expect(await screen.findByRole("cell", { name: "Piekarnia Kowalski" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Nawigacja główna" })).getByRole("link", {
        name: "Zlecenia",
      }),
    ).toHaveAttribute("aria-current", "page");
    expect(Object.fromEntries(requests[0] ?? [])).toEqual({
      page: "1",
      pageSize: "20",
      sortBy: "DueDate",
      sortDirection: "Asc",
    });
  });

  it("restores filters and sorting from the address", async () => {
    const requests = mockWorkOrders(1);
    renderApp(
      "/work-orders?status=Assigned&status=InProgress&overdue=true&sort=Priority&direction=Desc",
    );

    expect(await screen.findByRole("columnheader", { name: "Priorytet" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(screen.getByRole("checkbox", { name: "Przypisane" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "W realizacji" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Nowe" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Tylko po terminie" })).toBeChecked();
    expect(requests[0]?.getAll("status")).toEqual(["Assigned", "InProgress"]);
    expect(requests[0]?.get("isOverdue")).toBe("true");
    expect(requests[0]?.get("sortBy")).toBe("Priority");
  });

  it("goes back to the first page and keeps the filter in the address when it changes", async () => {
    const requests = mockWorkOrders(45);
    const router = renderApp("/work-orders?page=2");
    const user = userEvent.setup();

    await screen.findByRole("cell", { name: "Piekarnia Kowalski" });
    await user.click(screen.getByRole("button", { name: "Tylko otwarte" }));

    await vi.waitFor(() => {
      expect(requests.at(-1)?.getAll("status")).toEqual(["New", "Assigned", "InProgress"]);
    });
    expect(requests.at(-1)?.get("page")).toBe("1");
    expect(router.state.location.search).toBe("?status=New&status=Assigned&status=InProgress");
  });

  it("sorts by the clicked column and keeps the sorting in the address", async () => {
    const requests = mockWorkOrders(1);
    const router = renderApp("/work-orders");

    await userEvent.setup().click(await screen.findByRole("button", { name: "Status" }));

    await vi.waitFor(() => {
      expect(requests.at(-1)?.get("sortBy")).toBe("Status");
    });
    expect(router.state.location.search).toBe("?sort=Status&direction=Asc");
  });

  it("explains that there are no work orders yet", async () => {
    mockWorkOrders(0);
    renderApp("/work-orders");

    expect(await screen.findByRole("heading", { name: "Brak zleceń" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Wyczyść filtry" })).not.toBeInTheDocument();
  });

  it("lets the user clear filters that match no work orders", async () => {
    mockWorkOrders(0);
    const router = renderApp("/work-orders?search=xyz&status=Invoiced&sort=ClientName");

    expect(await screen.findByRole("heading", { name: "Brak wyników" })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Wyczyść filtry" }));

    expect(router.state.location.search).toBe("?sort=ClientName");
  });

  it("offers a retry when the list cannot be loaded", async () => {
    server.use(http.get(workOrdersUrl, () => HttpResponse.json(null, { status: 500 })));
    renderApp("/work-orders");

    expect(await screen.findByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  });
});
