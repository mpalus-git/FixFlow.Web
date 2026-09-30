import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceListItem, createDeviceResponse } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

type DeviceResponse = components["schemas"]["DeviceResponse"];
type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];
type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const device = createDeviceResponse();
const deviceUrl = `${apiBaseUrl}/api/v1/devices/${device.id}`;
const cardPath = `/devices/${device.id}`;

function mockCard(cardDevice: DeviceResponse = device) {
  const workOrderRequests: URLSearchParams[] = [];
  const workOrderPage: WorkOrderPage = {
    items: [createWorkOrderListItem()],
    page: 1,
    pageSize: 10,
    totalCount: 1,
  };
  server.use(
    http.get(deviceUrl, () => HttpResponse.json(cardDevice, { headers: { ETag: '"1"' } })),
    http.get(`${apiBaseUrl}/api/v1/clients/${device.clientId}`, () =>
      HttpResponse.json(createClientResponse(), { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/work-orders`, ({ request }) => {
      workOrderRequests.push(new URL(request.url).searchParams);
      return HttpResponse.json(workOrderPage);
    }),
  );
  return workOrderRequests;
}

describe("DeviceCardPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the device, a link to its client and its work order history", async () => {
    const workOrderRequests = mockCard();
    renderApp(cardPath);

    expect(
      await screen.findByRole("heading", { name: "SN-2024-0001", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("01.03.2024")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Piekarnia Kowalski" })).toHaveAttribute(
      "href",
      `/clients/${device.clientId}`,
    );
    const history = screen.getByRole("region", { name: "Historia zleceń" });
    expect(await within(history).findByText("Kocioł nie grzeje wody użytkowej")).toBeVisible();
    expect(workOrderRequests[0]?.get("deviceId")).toBe(device.id);
  });

  it("opens from the device list by the serial number", async () => {
    mockCard();
    const devicePage: DevicePage = {
      items: [createDeviceListItem()],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    };
    server.use(http.get(`${apiBaseUrl}/api/v1/devices`, () => HttpResponse.json(devicePage)));
    const user = userEvent.setup();
    const router = renderApp("/devices");

    await user.click(await screen.findByRole("link", { name: "SN-2024-0001" }));

    expect(
      await screen.findByRole("heading", { name: "SN-2024-0001", level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(cardPath);
  });

  it("marks an archived device", async () => {
    mockCard({ ...device, archivedAt: "2026-09-20T10:00:00Z" });
    renderApp(cardPath);

    expect(await screen.findByText("Zarchiwizowane")).toBeInTheDocument();
    expect(screen.getByText("20.09.2026")).toBeInTheDocument();
  });

  it("shows the not found page for a device that does not exist", async () => {
    const problem: ProblemDetails = { status: 404, title: "Not Found" };
    server.use(http.get(deviceUrl, () => HttpResponse.json(problem, { status: 404 })));
    renderApp(cardPath);

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
  });
});
