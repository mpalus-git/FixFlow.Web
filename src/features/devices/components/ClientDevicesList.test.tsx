import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router";
import { ClientDevicesList } from "@/features/devices";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createDeviceListItem } from "@/test/deviceFixtures";
import { server } from "@/test/server";

type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const devicesUrl = `${apiBaseUrl}/api/v1/devices`;
const clientId = "3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f";

function renderList(initialEntry = `/clients/${clientId}`) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ClientDevicesList clientId={clientId} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

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

describe("ClientDevicesList", () => {
  it("shows the devices with the installation date on the same calendar day", async () => {
    mockDevices({ items: [createDeviceListItem()], page: 1, pageSize: 10, totalCount: 1 });
    renderList();

    expect(await screen.findByRole("cell", { name: "SN-2024-0001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Viessmann Vitodens 200-W" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "01.03.2024" })).toBeInTheDocument();
  });

  it("asks only for the devices of the client and the page from the address", async () => {
    const requests = mockDevices({
      items: [createDeviceListItem()],
      page: 2,
      pageSize: 10,
      totalCount: 11,
    });
    renderList(`/clients/${clientId}?devicesPage=2`);

    expect(await screen.findByText("Strona 2 z 2")).toBeInTheDocument();
    expect(Object.fromEntries(requests[0] ?? [])).toEqual({
      clientId,
      page: "2",
      pageSize: "10",
    });
  });

  it("says when the client has no devices", async () => {
    mockDevices({ items: [], page: 1, pageSize: 10, totalCount: 0 });
    renderList();

    expect(await screen.findByText("Klient nie ma jeszcze urządzeń")).toBeInTheDocument();
  });

  it("offers a retry when the devices cannot be loaded", async () => {
    const problem: ProblemDetails = { status: 503, title: "Service Unavailable" };
    server.use(http.get(devicesUrl, () => HttpResponse.json(problem, { status: 503 })));
    renderList();

    await screen.findByRole("alert");
    mockDevices({ items: [createDeviceListItem()], page: 1, pageSize: 10, totalCount: 1 });
    await userEvent.setup().click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByRole("cell", { name: "SN-2024-0001" })).toBeInTheDocument();
  });
});
