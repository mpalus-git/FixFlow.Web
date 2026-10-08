import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { dispatchRefreshIntervalMs } from "@/features/dispatch/api/dispatchQueries";
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
  fullName: "Anna Nowak",
  role: "Technician",
  isActive: true,
};
const assignedToAnna = createWorkOrderListItem({
  clientName: "Hotel Zamek",
  clientAddress: { street: "Rynek", buildingNumber: "1", postalCode: "31-042", city: "Kraków" },
  status: "Assigned",
  technicianId: anna,
  dueDate: toUtcIso(`${addCalendarDays(currentWeek, 4)}T10:00`),
});

const newNextWeek = createWorkOrderListItem({
  id: "9f8e7d6c-5b4a-4f3e-8d2c-1b0a9f8e7d6c",
  number: "ZL/2026/0077",
  clientName: "Kawiarnia Rynek",
  status: "New",
  dueDate: toUtcIso(`${addCalendarDays(nextWeek, 2)}T10:00`),
});

function pageOf(items: WorkOrderPage["items"]): WorkOrderPage {
  return { items, page: 1, pageSize: 100, totalCount: items.length };
}

function mockBoard({
  technicians = [annaUser],
  unassigned = [],
  weekStatus = 200,
}: {
  technicians?: UserResponse[];
  unassigned?: WorkOrderPage["items"];
  weekStatus?: number;
} = {}) {
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
        return HttpResponse.json(pageOf(unassigned));
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
    vi.useRealTimers();
    endSession();
    localStorage.clear();
  });

  it("shows the current week of the technicians from the navigation entry", async () => {
    const weekRequests = mockBoard();
    renderApp("/dispatch");

    const annaRow = await screen.findByRole("row", { name: /Anna Nowak/ });
    expect(within(annaRow).getByRole("link", { name: "Hotel Zamek" })).toBeInTheDocument();
    expect(within(annaRow).getByText("Kraków")).toBeInTheDocument();
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
    await screen.findByRole("row", { name: /Anna Nowak/ });

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
    await vi.waitFor(
      () => {
        expect(weekRequests).toEqual([weekQuery(nextWeek)]);
      },
      { timeout: 5000 },
    );
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

    expect(await screen.findByRole("row", { name: /Anna Nowak/ })).toBeInTheDocument();
  });

  it("refreshes the board in the background while nothing is being dragged", async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    const weekRequests = mockBoard({ unassigned: [newNextWeek] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderApp("/dispatch");
    const handle = await screen.findByRole("button", { name: /Przenieś zlecenie ZL\/2026\/0077/ });
    expect(weekRequests).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(dispatchRefreshIntervalMs);

    await vi.waitFor(() => {
      expect(weekRequests).toHaveLength(2);
    });

    handle.focus();
    await user.keyboard("[Space]");
    await vi.advanceTimersByTimeAsync(dispatchRefreshIntervalMs * 2);

    expect(weekRequests).toHaveLength(2);

    await user.keyboard("[Escape]");
    await vi.advanceTimersByTimeAsync(dispatchRefreshIntervalMs);

    await vi.waitFor(() => {
      expect(weekRequests).toHaveLength(3);
    });
  });
});
