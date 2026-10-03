import { QueryClient, useMutation } from "@tanstack/react-query";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { ServerWakeBanner, slowResponseThresholdMs } from "@/app/layout/ServerWakeBanner";
import { shouldRetryQuery } from "@/shared/api/queryClient";
import { endSession } from "@/shared/session/sessionStore";
import { dashboardSummaryUrl, mockDashboardSummary } from "@/test/dashboardFixtures";
import { renderApp } from "@/test/renderApp";
import { renderWithProviders } from "@/test/renderWithProviders";
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

const waitingTitle = "Czekam na odpowiedź serwera";

function useServerTimers() {
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
}

async function advanceBy(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

function createGate() {
  let open: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { opened, open };
}

type HangingSaveProps = {
  request: Promise<void>;
};

function HangingSave({ request }: HangingSaveProps) {
  const { mutate } = useMutation({ mutationFn: () => request });
  return (
    <button
      type="button"
      onClick={() => {
        mutate();
      }}
    >
      Save
    </button>
  );
}

describe("ServerWakeBanner", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("explains the wait when the server holds a request without answering", async () => {
    useServerTimers();
    const gate = createGate();
    let requestCount = 0;
    mockDashboardSummary();
    server.use(
      http.get(dashboardSummaryUrl, async () => {
        requestCount += 1;
        await gate.opened;
        return undefined;
      }),
    );
    renderApp("/");
    await vi.waitFor(() => {
      expect(requestCount).toBe(1);
    });

    await advanceBy(slowResponseThresholdMs - 1_000);

    expect(screen.queryByText(waitingTitle)).not.toBeInTheDocument();

    await advanceBy(1_000);

    expect(await screen.findByText(waitingTitle)).toBeInTheDocument();
    expect(screen.queryByText("Brak połączenia z serwerem")).not.toBeInTheDocument();

    gate.open();

    expect(await screen.findByRole("link", { name: /Do przypisania/ })).toBeInTheDocument();
    expect(screen.queryByText(waitingTitle)).not.toBeInTheDocument();
  });

  it("explains the wait when saving takes long", async () => {
    useServerTimers();
    const gate = createGate();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderWithProviders(
      <>
        <ServerWakeBanner />
        <HangingSave request={gate.opened} />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    await advanceBy(slowResponseThresholdMs);

    expect(await screen.findByText(waitingTitle)).toBeInTheDocument();

    gate.open();

    await vi.waitFor(() => {
      expect(screen.queryByText(waitingTitle)).not.toBeInTheDocument();
    });
  });

  it("stays hidden when the server answers quickly", async () => {
    useServerTimers();
    mockDashboardSummary();
    renderApp("/");

    expect(await screen.findByRole("link", { name: /Do przypisania/ })).toBeInTheDocument();
    await advanceBy(slowResponseThresholdMs * 2);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
