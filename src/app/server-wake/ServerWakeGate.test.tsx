import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ServerReadyCheck } from "@/app/server-wake/checkServerReady";
import { ServerWakeGate } from "@/app/server-wake/ServerWakeGate";

function renderGate(checkReady: ServerReadyCheck) {
  render(
    <ServerWakeGate checkReady={checkReady}>
      <p>Login form</p>
    </ServerWakeGate>,
  );
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("ServerWakeGate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the application once the server is ready", async () => {
    renderGate(() => Promise.resolve(true));

    await advance(0);

    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("explains that the demo server is starting when it answers slowly", async () => {
    renderGate(() => Promise.resolve(false));

    expect(screen.getByRole("status")).toHaveTextContent("Łączenie z serwerem…");
    await advance(6_000);

    expect(screen.getByRole("heading", { name: "Serwer demo się uruchamia" })).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Postęp uruchamiania serwera" }),
    ).toHaveAttribute("aria-valuenow", "10");
    expect(screen.getByText("Minęło 6 s")).toBeInTheDocument();
    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
  });

  it("offers a retry after the server does not respond for 90 seconds", async () => {
    let serverIsUp = false;
    renderGate(() => Promise.resolve(serverIsUp));

    await advance(90_000);
    expect(screen.getByRole("alert")).toHaveTextContent("Serwer nie odpowiada");

    serverIsUp = true;
    vi.useRealTimers();
    await userEvent.setup().click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByText("Login form")).toBeInTheDocument();
  });
});
