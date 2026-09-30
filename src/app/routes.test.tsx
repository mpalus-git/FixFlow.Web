import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { endSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { mockCurrentUser, signInAs } from "@/test/signedInUser";

describe("routes", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the lazily loaded dashboard at the root path", async () => {
    signInAs("Dispatcher");
    renderApp("/");

    expect(await screen.findByRole("heading", { name: "Pulpit" })).toBeInTheDocument();
  });

  it("shows the not found page with a link home for an unknown path", async () => {
    signInAs("Dispatcher");
    renderApp("/does-not-exist");

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć na stronę główną" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("returns to the requested page after logging in", async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/login`, () =>
        HttpResponse.json(createAuthTokens("login")),
      ),
    );
    mockCurrentUser("Dispatcher");
    const user = userEvent.setup();
    const router = renderApp("/login?returnTo=%2Fmissing-page");

    await user.type(await screen.findByLabelText("E-mail"), "dispatcher@fixflow.test");
    await user.type(screen.getByLabelText("Hasło"), "Password-1");
    await user.click(screen.getByRole("button", { name: "Zaloguj się" }));

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/missing-page");
  });
});
