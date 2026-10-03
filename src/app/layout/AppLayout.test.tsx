import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

describe("AppLayout", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("marks the dashboard link as the current page", async () => {
    renderApp("/");

    const navigation = await screen.findByRole("navigation", { name: "Nawigacja główna" });

    expect(within(navigation).getByRole("link", { name: "Pulpit" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers a link that skips to the main content", async () => {
    renderApp("/");

    expect(await screen.findByRole("link", { name: "Przejdź do treści" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("closes the mobile menu after choosing a link", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: "Otwórz menu" }));
    const menu = screen.getByRole("dialog");
    await user.click(within(menu).getByRole("link", { name: "Pulpit" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows only the navigation of the technician role", async () => {
    signInAs("Technician");
    renderApp("/my-work-orders");

    const navigation = await screen.findByRole("navigation", { name: "Nawigacja główna" });

    expect(within(navigation).getByRole("link", { name: "Moje zlecenia" })).toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "Pulpit" })).toBeNull();
  });

  it("shows the account and signs out from the user menu", async () => {
    let isRevoked = false;
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/logout`, () => {
        isRevoked = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: "Konto użytkownika" }));
    expect(screen.getByText("Dispatcher Test")).toBeInTheDocument();
    expect(screen.getByText("dispatcher@fixflow.test")).toBeInTheDocument();
    expect(screen.getByText("Dyspozytor")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Wyloguj" }));

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(isRevoked).toBe(true);
  });

  it("shows that signing out is in progress while the server answers slowly", async () => {
    let answerRevoke = () => undefined;
    server.use(
      http.post(
        `${apiBaseUrl}/api/v1/auth/logout`,
        () =>
          new Promise<Response>((resolve) => {
            answerRevoke = () => {
              resolve(new HttpResponse(null, { status: 204 }));
            };
          }),
      ),
    );
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: "Konto użytkownika" }));
    await user.click(screen.getByRole("menuitem", { name: "Wyloguj" }));

    expect(await screen.findByRole("menuitem", { name: "Wylogowywanie…" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    answerRevoke();

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
  });
});
