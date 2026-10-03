import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { shouldRetryQuery } from "@/shared/api/queryClient";
import { endSession } from "@/shared/session/sessionStore";
import { dashboardSummaryUrl, mockDashboardSummary } from "@/test/dashboardFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

function createRetryingQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryQuery, retryDelay: 20 },
      mutations: { retry: false },
    },
  });
}

describe("ServerWakeBanner", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it.each([
    [
      "shows a loading page",
      () => HttpResponse.html("<html>Application loading</html>", { status: 503 }),
    ],
    ["cannot be reached", () => HttpResponse.error()],
  ])("keeps retrying with a banner while the sleeping server %s", async (_, sleepingResponse) => {
    let isAwake = false;
    mockDashboardSummary();
    server.use(http.get(dashboardSummaryUrl, () => (isAwake ? undefined : sleepingResponse())));
    renderApp("/", createRetryingQueryClient());

    expect(await screen.findByText("Brak połączenia z serwerem")).toBeInTheDocument();
    expect(screen.queryByText("Nie udało się wczytać danych")).not.toBeInTheDocument();

    isAwake = true;

    expect(await screen.findByRole("heading", { name: "Pulpit" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Do przypisania/ })).toBeInTheDocument();
    expect(screen.queryByText("Brak połączenia z serwerem")).not.toBeInTheDocument();
  });

  it("does not show the banner when the server answers with an error from the API", async () => {
    server.use(
      http.get(dashboardSummaryUrl, () =>
        HttpResponse.json({ status: 500, title: "Server error" }, { status: 500 }),
      ),
    );
    renderApp("/", createRetryingQueryClient());

    expect(await screen.findByRole("alert")).toHaveTextContent("Błąd serwera");
    expect(screen.queryByText("Brak połączenia z serwerem")).not.toBeInTheDocument();
  });
});
