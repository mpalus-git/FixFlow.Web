import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { mockEmptyClientCardLists } from "@/test/clientCardMocks";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceResponse } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type CreateDeviceRequest = components["schemas"]["CreateDeviceRequest"];

const client = createClientResponse();
const created = createDeviceResponse({ clientId: client.id });

describe("CreateDevicePage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("adds a device from the client card and opens the new device", async () => {
    const receivedBodies: CreateDeviceRequest[] = [];
    mockEmptyClientCardLists();
    server.use(
      http.get(`${apiBaseUrl}/api/v1/clients/${client.id}`, () =>
        HttpResponse.json(client, { headers: { ETag: '"1"' } }),
      ),
      http.post<never, CreateDeviceRequest>(`${apiBaseUrl}/api/v1/devices`, async ({ request }) => {
        receivedBodies.push(await request.json());
        return HttpResponse.json(created, { status: 201, headers: { ETag: '"1"' } });
      }),
      http.get(`${apiBaseUrl}/api/v1/devices/${created.id}`, () =>
        HttpResponse.json(created, { headers: { ETag: '"1"' } }),
      ),
    );
    const user = userEvent.setup();
    const router = renderApp(`/clients/${client.id}`);

    await user.click(await screen.findByRole("link", { name: "Dodaj urządzenie" }));
    expect(await screen.findByRole("heading", { name: "Nowe urządzenie" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Piekarnia Kowalski" })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Numer seryjny/), created.serialNumber);
    await user.type(screen.getByLabelText("Producent"), created.manufacturer);
    await user.type(screen.getByLabelText("Model"), created.model);
    await user.type(screen.getByLabelText("Data instalacji"), created.installationDate);
    await user.click(screen.getByRole("button", { name: "Dodaj urządzenie" }));

    expect(
      await screen.findByRole("heading", { name: created.serialNumber, level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/devices/${created.id}`);
    expect(receivedBodies).toEqual([
      {
        clientId: client.id,
        serialNumber: created.serialNumber,
        manufacturer: created.manufacturer,
        model: created.model,
        installationDate: created.installationDate,
      },
    ]);
  });
});
