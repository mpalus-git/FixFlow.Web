import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createDeviceListItem } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];

const devicesUrl = `${apiBaseUrl}/api/v1/devices`;

function mockDevices(devicePage: DevicePage) {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(devicesUrl, ({ request }) => {
      requests.push(new URL(request.url).searchParams);
      return HttpResponse.json(devicePage);
    }),
  );
  return requests;
}

describe("DevicesPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows each device with a link to its client", async () => {
    mockDevices({ items: [createDeviceListItem()], page: 1, pageSize: 20, totalCount: 1 });
    renderApp("/devices");

    const row = (await screen.findByRole("cell", { name: "SN-2024-0001" })).closest("tr");
    const cells = within(row ?? document.body);

    expect(cells.getByRole("link", { name: "Piekarnia Kowalski" })).toHaveAttribute(
      "href",
      "/clients/3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f",
    );
    expect(cells.getByText("Viessmann Vitodens 200-W")).toBeInTheDocument();
    expect(cells.getByText("01.03.2024")).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Nawigacja główna" })).getByRole("link", {
        name: "Urządzenia",
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("searches by serial number, model or manufacturer and keeps the search in the address", async () => {
    const requests = mockDevices({
      items: [createDeviceListItem()],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    });
    const router = renderApp("/devices");

    await userEvent.setup().type(await screen.findByLabelText("Szukaj urządzeń"), "vitodens");

    await vi.waitFor(() => {
      expect(router.state.location.search).toBe("?search=vitodens");
    });
    expect(requests.at(-1)?.get("search")).toBe("vitodens");
    expect(requests.at(-1)?.get("pageSize")).toBe("20");
  });

  it("points to the client cards when there are no devices yet", async () => {
    mockDevices({ items: [], page: 1, pageSize: 20, totalCount: 0 });
    renderApp("/devices");

    expect(await screen.findByRole("heading", { name: "Brak urządzeń" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Przejdź do klientów" })).toHaveAttribute(
      "href",
      "/clients",
    );
  });

  it("sends a technician back to their own work orders", async () => {
    signInAs("Technician");
    const router = renderApp("/devices");

    expect(await screen.findByRole("heading", { name: "Moje zlecenia" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/my-work-orders");
  });
});
