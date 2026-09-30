import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { mockEmptyClientCardLists } from "@/test/clientCardMocks";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceListItem, createDeviceResponse } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const device = createDeviceResponse();
const devicesUrl = `${apiBaseUrl}/api/v1/devices`;
const archiveUrl = `${devicesUrl}/${device.id}/archive`;

function mockDeviceList(archivedIds: readonly string[] = []) {
  server.use(
    http.get(devicesUrl, () => {
      const items = [createDeviceListItem()].filter((item) => !archivedIds.includes(item.id));
      const devicePage: DevicePage = { items, page: 1, pageSize: 20, totalCount: items.length };
      return HttpResponse.json(devicePage);
    }),
  );
}

async function archiveFromList(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Akcje urządzenia SN-2024-0001" }));
  await user.click(screen.getByRole("menuitem", { name: "Archiwizuj" }));
  const dialog = screen.getByRole("alertdialog", {
    name: "Zarchiwizować urządzenie SN-2024-0001?",
  });
  await user.click(within(dialog).getByRole("button", { name: "Archiwizuj" }));
}

describe("device archiving", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("archives a device from the list after confirmation", async () => {
    const archivedIds: string[] = [];
    mockDeviceList(archivedIds);
    server.use(
      http.post(archiveUrl, () => {
        archivedIds.push(device.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderApp("/devices");

    await archiveFromList(user);

    expect(await screen.findByText("Zarchiwizowano urządzenie SN-2024-0001.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Brak urządzeń" })).toBeInTheDocument();
  });

  it("brings the device back and explains why when archiving fails", async () => {
    mockDeviceList();
    const problem: ProblemDetails = {
      status: 409,
      title: "Conflict",
      detail: "The device was changed by another request.",
    };
    server.use(http.post(archiveUrl, () => HttpResponse.json(problem, { status: 409 })));
    const user = userEvent.setup();
    renderApp("/devices");

    await archiveFromList(user);

    expect(
      await screen.findByText("The device was changed by another request."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "SN-2024-0001" })).toBeInTheDocument();
  });

  it("returns to the client card after archiving from the device card", async () => {
    const client = createClientResponse();
    mockEmptyClientCardLists();
    server.use(
      http.get(`${devicesUrl}/${device.id}`, () =>
        HttpResponse.json(device, { headers: { ETag: '"1"' } }),
      ),
      http.get(`${apiBaseUrl}/api/v1/clients/${client.id}`, () =>
        HttpResponse.json(client, { headers: { ETag: '"1"' } }),
      ),
      http.post(archiveUrl, () => new HttpResponse(null, { status: 204 })),
    );
    const user = userEvent.setup();
    const router = renderApp(`/devices/${device.id}`);

    await user.click(await screen.findByRole("button", { name: "Archiwizuj" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Archiwizuj" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Piekarnia Kowalski", level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/clients/${client.id}`);
  });
});
