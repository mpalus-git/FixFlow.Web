import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type ClientResponse = components["schemas"]["ClientResponse"];
type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const clientsUrl = `${apiBaseUrl}/api/v1/clients`;

const allClients: ClientResponse[] = Array.from({ length: 25 }, (_, index) =>
  createClientResponse({
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    name: `Klient ${String(index + 1).padStart(2, "0")}`,
  }),
);

function mockClientList(archivedIds: readonly string[] = []) {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(clientsUrl, ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const page = Number(params.get("page"));
      const pageSize = Number(params.get("pageSize"));
      const search = params.get("search")?.toLowerCase() ?? "";
      const matching = allClients.filter(
        (client) => client.name.toLowerCase().includes(search) && !archivedIds.includes(client.id),
      );
      const clientPage: ClientPage = {
        items: matching.slice((page - 1) * pageSize, page * pageSize),
        page,
        pageSize,
        totalCount: matching.length,
      };
      return HttpResponse.json(clientPage);
    }),
  );
  return requests;
}

describe("ClientsPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the first page of clients with their address and contact", async () => {
    mockClientList();
    renderApp("/clients");

    const firstRow = (await screen.findByRole("cell", { name: "Klient 01" })).closest("tr");

    expect(firstRow).not.toBeNull();
    expect(
      within(firstRow ?? document.body).getByText("Mariacka 12A, 40-014 Katowice"),
    ).toBeVisible();
    expect(screen.getAllByRole("row")).toHaveLength(21);
    expect(screen.getByText("Strona 1 z 2")).toBeInTheDocument();
    expect(screen.getByText("25 pozycji")).toBeInTheDocument();
  });

  it("keeps the page in the address when moving to the next page", async () => {
    const requests = mockClientList();
    const user = userEvent.setup();
    const router = renderApp("/clients");

    await user.click(await screen.findByRole("button", { name: "Następna strona" }));

    expect(await screen.findByRole("cell", { name: "Klient 21" })).toBeInTheDocument();
    expect(router.state.location.search).toBe("?page=2");
    expect(requests.at(-1)?.get("page")).toBe("2");
  });

  it("searches by name, stores the search in the address and starts from the first page", async () => {
    const requests = mockClientList();
    const user = userEvent.setup();
    const router = renderApp("/clients?page=2");

    await user.type(await screen.findByLabelText("Szukaj klientów"), "Klient 1");

    expect(await screen.findByText("Strona 1 z 1")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?search=Klient+1");
    expect(requests.at(-1)?.get("search")).toBe("Klient 1");
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("restores the search from the address after a reload", async () => {
    mockClientList();
    renderApp("/clients?search=Klient%2025");

    expect(await screen.findByRole("cell", { name: "Klient 25" })).toBeInTheDocument();
    expect(screen.getByLabelText("Szukaj klientów")).toHaveValue("Klient 25");
  });

  it("invites to add the first client when there are none", async () => {
    const emptyPage: ClientPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
    server.use(http.get(clientsUrl, () => HttpResponse.json(emptyPage)));
    renderApp("/clients");

    expect(await screen.findByRole("heading", { name: "Brak klientów" })).toBeInTheDocument();
  });

  it("explains when no client matches the search", async () => {
    mockClientList();
    renderApp("/clients?search=Serwis");

    expect(await screen.findByRole("heading", { name: "Brak wyników" })).toBeInTheDocument();
    expect(screen.getByText("Żaden klient nie ma w nazwie „Serwis”.")).toBeInTheDocument();
  });

  it("moves to the last existing page when the requested page is out of range", async () => {
    mockClientList();
    const router = renderApp("/clients?page=9");

    expect(await screen.findByRole("cell", { name: "Klient 21" })).toBeInTheDocument();
    expect(router.state.location.search).toBe("?page=2");
  });

  it("shows an error with a retry when the list cannot be loaded", async () => {
    const problem: ProblemDetails = { status: 500, title: "Server error" };
    server.use(http.get(clientsUrl, () => HttpResponse.json(problem, { status: 500 })));
    renderApp("/clients");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Nie udało się wczytać danych");
    expect(alert).toHaveTextContent("Błąd serwera");

    mockClientList();
    await userEvent.setup().click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByRole("cell", { name: "Klient 01" })).toBeInTheDocument();
  });

  it("archives a client after confirmation and removes it from the list", async () => {
    const archivedIds: string[] = [];
    mockClientList(archivedIds);
    server.use(
      http.post(`${clientsUrl}/:clientId/archive`, ({ params }) => {
        archivedIds.push(String(params.clientId));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderApp("/clients");

    await user.click(await screen.findByRole("button", { name: "Akcje klienta Klient 01" }));
    await user.click(screen.getByRole("menuitem", { name: "Archiwizuj" }));
    const dialog = screen.getByRole("alertdialog", { name: "Zarchiwizować klienta Klient 01?" });
    await user.click(within(dialog).getByRole("button", { name: "Archiwizuj" }));

    expect(await screen.findByText("Zarchiwizowano klienta Klient 01.")).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Klient 01" })).toBeNull();
    expect(screen.getByText("24 pozycje")).toBeInTheDocument();
    expect(archivedIds).toEqual([allClients[0]?.id]);
  });

  it("does not archive when the user cancels", async () => {
    mockClientList();
    const user = userEvent.setup();
    renderApp("/clients");

    await user.click(await screen.findByRole("button", { name: "Akcje klienta Klient 02" }));
    await user.click(screen.getByRole("menuitem", { name: "Archiwizuj" }));
    await user.click(screen.getByRole("button", { name: "Anuluj" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("cell", { name: "Klient 02" })).toBeInTheDocument();
  });

  it("brings the client back and explains why when archiving fails", async () => {
    mockClientList();
    const problem: ProblemDetails = {
      status: 409,
      title: "Conflict",
      detail: "The client was changed by another request.",
    };
    server.use(
      http.post(`${clientsUrl}/:clientId/archive`, () =>
        HttpResponse.json(problem, { status: 409 }),
      ),
    );
    const user = userEvent.setup();
    renderApp("/clients");

    await user.click(await screen.findByRole("button", { name: "Akcje klienta Klient 03" }));
    await user.click(screen.getByRole("menuitem", { name: "Archiwizuj" }));
    await user.click(screen.getByRole("button", { name: "Archiwizuj" }));

    expect(
      await screen.findByText("The client was changed by another request."),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Klient 03" })).toBeInTheDocument();
  });

  it("sends a technician back to their own work orders", async () => {
    signInAs("Technician");
    const router = renderApp("/clients");

    expect(await screen.findByRole("heading", { name: "Moje zlecenia" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/my-work-orders");
  });
});
