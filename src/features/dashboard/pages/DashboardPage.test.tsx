import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { dashboardRefreshIntervalMs } from "@/features/dashboard/api/dashboardQueries";
import type { components } from "@/shared/api/schema";
import { formatDateTime } from "@/shared/lib/dateTime";
import { endSession } from "@/shared/session/sessionStore";
import {
  createDashboardSummary,
  dashboardSummaryUrl,
  mockDashboardSummary,
} from "@/test/dashboardFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type ProblemDetails = components["schemas"]["ProblemDetails"];

function tile(name: RegExp) {
  return within(screen.getByRole("list", { name: "Wymaga uwagi" })).getByRole("link", {
    name,
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    vi.useRealTimers();
    endSession();
    localStorage.clear();
  });

  it("shows the work order queues and missing parts with links to the matching lists", async () => {
    mockDashboardSummary();
    renderApp("/");

    await screen.findByRole("list", { name: "Wymaga uwagi" });

    expect(tile(/Do przypisania/)).toHaveTextContent("3");
    expect(tile(/Do przypisania/)).toHaveAttribute("href", "/work-orders?status=New");
    expect(tile(/W realizacji/)).toHaveTextContent("2");
    expect(tile(/Do zafakturowania/)).toHaveAttribute("href", "/work-orders?status=Completed");
    expect(tile(/Opóźnione/)).toHaveTextContent("1");
    expect(tile(/Opóźnione/)).toHaveAttribute("href", "/work-orders?overdue=true");
    expect(tile(/Części bez stanu/)).toHaveTextContent("1");
    expect(tile(/Części bez stanu/)).toHaveAttribute("href", "/parts?stock=out");
    expect(
      screen.getByText(`Stan na ${formatDateTime("2026-10-01T08:30:00Z", "pl")}`),
    ).toBeInTheDocument();
  });

  it("describes the status chart with a table for screen readers", async () => {
    mockDashboardSummary();
    renderApp("/");

    const table = await screen.findByRole("table", { name: "Zlecenia według statusu" });

    expect(
      within(table)
        .getAllByRole("row")
        .map((row) => row.textContent),
    ).toEqual([
      "StatusZlecenia",
      "Nowe3",
      "Przypisane5",
      "W realizacji2",
      "Zakończone4",
      "Zafakturowane9",
    ]);
  });

  it("explains that there are no work orders instead of drawing empty bars", async () => {
    mockDashboardSummary(
      createDashboardSummary({
        statusCounts: createDashboardSummary().statusCounts.map(({ status }) => ({
          status,
          count: 0,
        })),
        overdueCount: 0,
      }),
    );
    renderApp("/");

    expect(await screen.findByText("W systemie nie ma jeszcze zleceń")).toBeInTheDocument();
    expect(
      screen.queryByRole("table", { name: "Zlecenia według statusu" }),
    ).not.toBeInTheDocument();
  });

  it("lists each technician's open work orders with links to their list and the week board", async () => {
    mockDashboardSummary();
    renderApp("/");

    const table = await screen.findByRole("table", { name: "Zlecenia techników" });
    const rows = within(table).getAllByRole("row");

    expect(rows.map((row) => row.textContent)).toEqual([
      "TechnikPrzypisaneW realizacjiOpóźnioneW tym tygodniu",
      "Anna Kowalczyk3112",
      "Tomasz Wójcik2101",
    ]);
    expect(within(table).getByRole("link", { name: "Anna Kowalczyk" })).toHaveAttribute(
      "href",
      "/work-orders?technician=00000000-0000-4000-8000-0000000000a2",
    );
    expect(screen.getByRole("link", { name: "Tablica tygodnia" })).toHaveAttribute(
      "href",
      "/dispatch?week=2026-09-28",
    );
  });

  it("explains that there are no active technicians", async () => {
    mockDashboardSummary(createDashboardSummary({ technicians: [] }));
    renderApp("/");

    expect(await screen.findByText("Brak aktywnych techników")).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "Zlecenia techników" })).not.toBeInTheDocument();
  });

  it("loads the summary again when refreshed", async () => {
    const requestCount = mockDashboardSummary();
    renderApp("/");

    await screen.findByRole("list", { name: "Wymaga uwagi" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Odśwież" }));

    await vi.waitFor(() => {
      expect(requestCount()).toBe(2);
    });
  });

  it("refreshes the summary in the background every minute", async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    const requestCount = mockDashboardSummary();
    renderApp("/");
    await screen.findByRole("list", { name: "Wymaga uwagi" });
    expect(requestCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(dashboardRefreshIntervalMs);

    await vi.waitFor(() => {
      expect(requestCount()).toBe(2);
    });
  });

  it("shows an error with a retry when the summary cannot be loaded", async () => {
    const problem: ProblemDetails = { status: 500, title: "Server error" };
    server.use(http.get(dashboardSummaryUrl, () => HttpResponse.json(problem, { status: 500 })));
    renderApp("/");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    mockDashboardSummary();
    await userEvent.setup().click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByRole("list", { name: "Wymaga uwagi" })).toBeInTheDocument();
  });
});
