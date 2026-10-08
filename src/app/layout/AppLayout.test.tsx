import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { mockEmptyClientCardLists } from "@/test/clientCardMocks";
import { createClientResponse } from "@/test/clientFixtures";
import { mockDashboardSummary } from "@/test/dashboardFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];

function mockEmptyClientList() {
  const emptyPage: ClientPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
  server.use(http.get(`${apiBaseUrl}/api/v1/clients`, () => HttpResponse.json(emptyPage)));
}

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

  it("moves focus to the heading of the new page after following a link", async () => {
    mockDashboardSummary();
    mockEmptyClientList();
    const user = userEvent.setup();
    renderApp("/");

    const navigation = await screen.findByRole("navigation", { name: "Nawigacja główna" });
    expect(screen.getByRole("heading", { level: 1, name: "Pulpit" })).not.toHaveFocus();
    await user.click(within(navigation).getByRole("link", { name: "Klienci" }));

    const heading = await screen.findByRole("heading", { level: 1, name: "Klienci" });
    await vi.waitFor(() => {
      expect(heading).toHaveFocus();
    });
  });

  it("keeps focus in the search field when only the list parameters change", async () => {
    mockEmptyClientList();
    const user = userEvent.setup();
    const router = renderApp("/clients");

    await user.type(await screen.findByRole("searchbox"), "Serwis");

    await vi.waitFor(() => {
      expect(router.state.location.search).toContain("search=Serwis");
    });
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("marks the main content busy while the next page is loading", async () => {
    const client = createClientResponse({ name: "Piekarnia Kowalski" });
    const clientPage: ClientPage = { items: [client], page: 1, pageSize: 20, totalCount: 1 };
    let answerClient = () => undefined;
    server.use(
      http.get(`${apiBaseUrl}/api/v1/clients`, () => HttpResponse.json(clientPage)),
      http.get(
        `${apiBaseUrl}/api/v1/clients/:clientId`,
        () =>
          new Promise<Response>((resolve) => {
            answerClient = () => {
              resolve(HttpResponse.json(client, { headers: { ETag: '"1"' } }));
            };
          }),
      ),
    );
    mockEmptyClientCardLists();
    const user = userEvent.setup();
    renderApp("/clients");

    await user.click(await screen.findByRole("link", { name: "Piekarnia Kowalski" }));

    await vi.waitFor(() => {
      expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    });
    answerClient();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Piekarnia Kowalski" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "false");
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

  it("does not keep the current page as the return path after signing out", async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
    );
    const user = userEvent.setup();
    const router = renderApp("/profile");

    await user.click(await screen.findByRole("button", { name: "Konto użytkownika" }));
    await user.click(screen.getByRole("menuitem", { name: "Wyloguj" }));

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.search).toBe("");
  });

  it("keeps the current page as the return path when the session expires", async () => {
    const router = renderApp("/profile");
    await screen.findByRole("button", { name: "Konto użytkownika" });

    act(() => {
      endSession("expired");
    });

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(router.state.location.search).toBe("?returnTo=%2Fprofile");
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
