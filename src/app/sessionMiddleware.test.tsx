import { act, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { refreshTokenStorageKey } from "@/shared/session/refreshTokenStorage";
import { endSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { mockCurrentUser, signInAs } from "@/test/signedInUser";

describe("session middleware", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("sends a visitor without a session to the login page with the requested path", async () => {
    const router = renderApp("/my-work-orders?page=2");

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.search).toBe("?returnTo=%2Fmy-work-orders%3Fpage%3D2");
  });

  it("replaces the history entry instead of adding one when redirecting on the first visit", async () => {
    const router = renderApp("/");

    await screen.findByRole("heading", { name: "Zaloguj się" });

    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("restores the session from the stored refresh token", async () => {
    localStorage.setItem(refreshTokenStorageKey, "refresh-previous-visit");
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/refresh`, () =>
        HttpResponse.json(createAuthTokens("restored")),
      ),
    );
    mockCurrentUser("Dispatcher");

    renderApp("/");

    expect(await screen.findByRole("heading", { name: "Pulpit" })).toBeInTheDocument();
  });

  it("explains the rate limit when the session cannot be restored yet", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    localStorage.setItem(refreshTokenStorageKey, "refresh-previous-visit");
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/refresh`, () =>
        HttpResponse.json(
          { status: 429, title: "Too many requests" },
          { status: 429, headers: { "Retry-After": "30" } },
        ),
      ),
    );

    renderApp("/");

    expect(await screen.findByRole("alert")).toHaveTextContent("Zbyt wiele prób logowania");
    expect(screen.getByRole("button", { name: "Spróbuj ponownie za 30 s" })).toBeDisabled();
  });

  it("sends a technician from the dashboard to their work orders", async () => {
    signInAs("Technician");

    const router = renderApp("/");

    expect(await screen.findByRole("heading", { name: "Moje zlecenia" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/my-work-orders");
  });

  it("sends a dispatcher from the technician view to the dashboard", async () => {
    signInAs("Dispatcher");

    const router = renderApp("/my-work-orders");

    expect(await screen.findByRole("heading", { name: "Pulpit" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  it("skips the login page when the user is already signed in", async () => {
    signInAs("Technician");

    const router = renderApp("/login");

    expect(await screen.findByRole("heading", { name: "Moje zlecenia" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/my-work-orders");
  });

  it("keeps a signed-in user inside the application when returnTo points to another site", async () => {
    signInAs("Technician");

    const router = renderApp("/login?returnTo=%2F%5Cevil.test");

    expect(await screen.findByRole("heading", { name: "Moje zlecenia" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/my-work-orders");
  });

  it("returns to the login page when the session ends", async () => {
    signInAs("Dispatcher");
    const router = renderApp("/");
    await screen.findByRole("heading", { name: "Pulpit" });

    act(() => {
      endSession();
    });

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });
});
