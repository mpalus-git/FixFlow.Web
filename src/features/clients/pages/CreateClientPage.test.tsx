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

type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];
type ClientRequest = components["schemas"]["CreateClientRequest"];

const clientsUrl = `${apiBaseUrl}/api/v1/clients`;

describe("CreateClientPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("creates a client from the list and opens its card", async () => {
    const created = createClientResponse({ email: null });
    const receivedBodies: ClientRequest[] = [];
    const clientPage: ClientPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
    server.use(
      http.get(clientsUrl, () => HttpResponse.json(clientPage)),
      http.post<never, ClientRequest>(clientsUrl, async ({ request }) => {
        receivedBodies.push(await request.json());
        return HttpResponse.json(created, { status: 201 });
      }),
      http.get(`${clientsUrl}/${created.id}`, () =>
        HttpResponse.json(created, { headers: { ETag: '"1"' } }),
      ),
    );
    mockEmptyClientCardLists();
    const user = userEvent.setup();
    const router = renderApp("/clients");

    await user.click(await screen.findByRole("link", { name: "Dodaj klienta" }));
    await user.type(await screen.findByLabelText("Nazwa"), created.name);
    await user.type(screen.getByLabelText("Ulica"), created.address.street);
    await user.type(screen.getByLabelText("Numer budynku"), created.address.buildingNumber);
    await user.type(screen.getByLabelText("Kod pocztowy"), created.address.postalCode);
    await user.type(screen.getByLabelText("Miejscowość"), created.address.city);
    await user.type(screen.getByLabelText("Osoba kontaktowa"), created.contactPerson);
    await user.type(screen.getByLabelText("Telefon"), created.phone);
    await user.click(screen.getByRole("button", { name: "Dodaj klienta" }));

    expect(
      await screen.findByRole("heading", { name: created.name, level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/clients/${created.id}`);
    expect(receivedBodies).toEqual([
      {
        name: created.name,
        address: created.address,
        contactPerson: created.contactPerson,
        phone: created.phone,
        email: null,
      },
    ]);
  });
});
