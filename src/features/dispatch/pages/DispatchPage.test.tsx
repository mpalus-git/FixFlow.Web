import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import {
  addCalendarDays,
  formatCalendarDate,
  todayCalendarDate,
  toUtcIso,
  weekStartOf,
} from "@/shared/lib/dateTime";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type UserResponse = components["schemas"]["UserResponse"];

const currentWeek = weekStartOf(todayCalendarDate());
const nextWeek = addCalendarDays(currentWeek, 7);

function weekRange(weekStart: string) {
  return `${formatCalendarDate(weekStart, "pl")} – ${formatCalendarDate(addCalendarDays(weekStart, 6), "pl")}`;
}

function weekQuery(weekStart: string) {
  return `${weekStart}..${addCalendarDays(weekStart, 6)}`;
}

const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const annaUser: UserResponse = {
  id: anna,
  email: "anna@fixflow.test",
  role: "Technician",
  isActive: true,
};
const assignedToAnna = createWorkOrderListItem({
  clientName: "Hotel Zamek",
  status: "Assigned",
  technicianId: anna,
  dueDate: toUtcIso(`${addCalendarDays(currentWeek, 4)}T10:00`),
});

function pageOf(items: WorkOrderPage["items"]): WorkOrderPage {
  return { items, page: 1, pageSize: 100, totalCount: items.length };
}

function mockBoard({
  technicians = [annaUser],
  weekStatus = 200,
}: { technicians?: UserResponse[]; weekStatus?: number } = {}) {
  const weekRequests: string[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/users`, () => {
      const userPage: UserPage = {
        items: technicians,
        page: 1,
        pageSize: 100,
        totalCount: technicians.length,
      };
      return HttpResponse.json(userPage);
    }),
    http.get(`${apiBaseUrl}/api/v1/work-orders`, ({ request }) => {
      const query = new URL(request.url).searchParams;
      if (query.get("status") === "New") {
        return HttpResponse.json(pageOf([]));
      }
      weekRequests.push(`${query.get("dueFrom") ?? ""}..${query.get("dueTo") ?? ""}`);
      if (weekStatus !== 200) {
        return HttpResponse.json(null, { status: weekStatus });
      }
      return HttpResponse.json(
        pageOf(query.get("dueFrom") === currentWeek ? [assignedToAnna] : []),
      );
    }),
  );
  return weekRequests;
}

describe("DispatchPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the current week of the technicians from the navigation entry", async () => {
    const weekRequests = mockBoard();
    renderApp("/dispatch");

    const annaRow = await screen.findByRole("row", { name: /anna@fixflow\.test/ });
    expect(within(annaRow).getByRole("link", { name: "Hotel Zamek" })).toBeInTheDocument();
    expect(screen.getByText(weekRange(currentWeek))).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Nawigacja główna" })).getByRole("link", {
        name: "Tablica dispatch",
      }),
    ).toHaveAttribute("aria-current", "page");
    expect(weekRequests).toEqual([weekQuery(currentWeek)]);
  });

  it("switches weeks and keeps the chosen week in the address", async () => {
    const weekRequests = mockBoard();
    const user = userEvent.setup();
    const router = renderApp("/dispatch");
    await screen.findByRole("row", { name: /anna@fixflow\.test/ });

    await user.click(screen.getByRole("button", { name: "Następny tydzień" }));

    expect(await screen.findByText(weekRange(nextWeek))).toBeInTheDocument();
    expect(router.state.location.search).toBe(`?week=${nextWeek}`);
    expect(
      await screen.findByText("W tym tygodniu technicy nie mają przypisanych zleceń."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bieżący tydzień" }));

    expect(router.state.location.search).toBe("");
    expect(weekRequests).toContain(weekQuery(nextWeek));
  });

  it("opens the week of any day given in the address", async () => {
    const weekRequests = mockBoard();
    renderApp(`/dispatch?week=${addCalendarDays(nextWeek, 2)}`);

    expect(await screen.findByText(weekRange(nextWeek))).toBeInTheDocument();
    expect(weekRequests).toEqual([weekQuery(nextWeek)]);
  });

  it("explains that there is no technician to plan for", async () => {
    mockBoard({ technicians: [] });
    renderApp("/dispatch");

    expect(await screen.findByRole("heading", { name: "Brak techników" })).toBeInTheDocument();
  });

  it("offers a retry when the work orders cannot be loaded", async () => {
    mockBoard({ weekStatus: 500 });
    const user = userEvent.setup();
    renderApp("/dispatch");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    mockBoard();
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByRole("row", { name: /anna@fixflow\.test/ })).toBeInTheDocument();
  });
});
