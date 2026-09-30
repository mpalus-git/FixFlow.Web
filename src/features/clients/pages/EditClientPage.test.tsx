import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { mockEmptyClientCardLists } from "@/test/clientCardMocks";
import { signInAs } from "@/test/signedInUser";

type ClientRequest = components["schemas"]["UpdateClientRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const client = createClientResponse();
const clientUrl = `${apiBaseUrl}/api/v1/clients/${client.id}`;
const editPath = `/clients/${client.id}/edit`;

function mockClientVersions(...versions: [typeof client, string][]) {
  let served = 0;
  server.use(
    http.get(clientUrl, () => {
      const [body, etag] = versions[Math.min(served, versions.length - 1)] ?? [client, '"1"'];
      served += 1;
      return HttpResponse.json(body, { headers: { ETag: etag } });
    }),
  );
}

describe("EditClientPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("saves the changes with the version the user edited and returns to the card", async () => {
    let storedClient = client;
    let storedEtag = '"1"';
    mockEmptyClientCardLists();
    const receivedIfMatch: (string | null)[] = [];
    server.use(
      http.get(clientUrl, () => HttpResponse.json(storedClient, { headers: { ETag: storedEtag } })),
      http.put<never, ClientRequest>(clientUrl, async ({ request }) => {
        receivedIfMatch.push(request.headers.get("If-Match"));
        storedClient = { ...client, ...(await request.json()) };
        storedEtag = '"2"';
        return HttpResponse.json(storedClient, { headers: { ETag: storedEtag } });
      }),
    );
    const user = userEvent.setup();
    const router = renderApp(editPath);

    const nameInput = await screen.findByLabelText("Nazwa");
    expect(nameInput).toHaveValue("Piekarnia Kowalski");
    await user.clear(nameInput);
    await user.type(nameInput, "Piekarnia Kowalski i Syn");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(
      await screen.findByRole("heading", { name: "Piekarnia Kowalski i Syn", level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/clients/${client.id}`);
    expect(receivedIfMatch).toEqual(['"1"']);
  });

  it("offers to load the current version after a conflict and never overwrites it", async () => {
    const changedClient = { ...client, contactPerson: "Anna Nowak" };
    mockClientVersions([client, '"1"'], [changedClient, '"2"']);
    let putCount = 0;
    server.use(
      http.put(clientUrl, () => {
        putCount += 1;
        const problem: ProblemDetails = { status: 412, title: "Precondition Failed" };
        return HttpResponse.json(problem, { status: 412 });
      }),
    );
    const user = userEvent.setup();
    renderApp(editPath);

    await user.type(await screen.findByLabelText("Nazwa"), " i Syn");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));
    await screen.findByRole("alertdialog", { name: "Dane zmieniły się w międzyczasie" });
    await user.click(screen.getByRole("button", { name: "Wczytaj aktualną wersję" }));

    expect(await screen.findByDisplayValue("Anna Nowak")).toBeInTheDocument();
    expect(screen.getByLabelText("Nazwa")).toHaveValue("Piekarnia Kowalski");
    expect(putCount).toBe(1);
  });

  it("shows the not found page for a client that does not exist", async () => {
    const problem: ProblemDetails = { status: 404, title: "Not Found" };
    server.use(http.get(clientUrl, () => HttpResponse.json(problem, { status: 404 })));
    renderApp(editPath);

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Nawigacja główna" })).toBeInTheDocument();
  });

  it("does not allow editing an archived client", async () => {
    mockClientVersions([{ ...client, archivedAt: "2026-09-20T10:00:00Z" }, '"3"']);
    renderApp(editPath);

    expect(await screen.findByRole("note")).toHaveTextContent("Klient jest zarchiwizowany");
    expect(screen.getByLabelText("Nazwa")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zapisz zmiany" })).toBeDisabled();
  });
});
