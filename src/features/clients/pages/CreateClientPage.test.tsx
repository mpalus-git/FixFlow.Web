import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
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

  it("creates a client from the list and shows it after returning", async () => {
    const created = createClientResponse({ email: null });
    const receivedBodies: ClientRequest[] = [];
    let clientPage: ClientPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
    server.use(
      http.get(clientsUrl, () => HttpResponse.json(clientPage)),
      http.post<never, ClientRequest>(clientsUrl, async ({ request }) => {
        receivedBodies.push(await request.json());
        clientPage = { ...clientPage, items: [created], totalCount: 1 };
        return HttpResponse.json(created, { status: 201 });
      }),
    );
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

    expect(await screen.findByRole("cell", { name: created.name })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/clients");
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
