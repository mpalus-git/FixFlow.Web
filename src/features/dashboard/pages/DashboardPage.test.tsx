import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { components } from "@/shared/api/schema";
import { formatDateTime } from "@/shared/lib/dateTime";
import { endSession } from "@/shared/session/sessionStore";
import { dashboardSummaryUrl, mockDashboardSummary } from "@/test/dashboardFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type ProblemDetails = components["schemas"]["ProblemDetails"];

function tile(name: RegExp) {
  return within(screen.getByRole("list", { name: "Zlecenia wymagające uwagi" })).getByRole("link", {
    name,
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the work order queues with links to the matching lists", async () => {
    mockDashboardSummary();
    renderApp("/");

    await screen.findByRole("list", { name: "Zlecenia wymagające uwagi" });

    expect(tile(/Do przypisania/)).toHaveTextContent("3");
    expect(tile(/Do przypisania/)).toHaveAttribute("href", "/work-orders?status=New");
    expect(tile(/W realizacji/)).toHaveTextContent("2");
    expect(tile(/Do zafakturowania/)).toHaveAttribute("href", "/work-orders?status=Completed");
    expect(tile(/Opóźnione/)).toHaveTextContent("1");
    expect(tile(/Opóźnione/)).toHaveAttribute("href", "/work-orders?overdue=true");
    expect(
      screen.getByText(`Stan na ${formatDateTime("2026-10-01T08:30:00Z", "pl")}`),
    ).toBeInTheDocument();
  });

  it("loads the summary again when refreshed", async () => {
    const requestCount = mockDashboardSummary();
    renderApp("/");

    await screen.findByRole("list", { name: "Zlecenia wymagające uwagi" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Odśwież" }));

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

    expect(
      await screen.findByRole("list", { name: "Zlecenia wymagające uwagi" }),
    ).toBeInTheDocument();
  });
});
