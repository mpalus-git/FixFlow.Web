import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router";
import { DeviceClientName } from "@/features/devices/components/DeviceClientName";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceResponse } from "@/test/deviceFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

const device = createDeviceResponse();

function mockDeviceAndClient() {
  server.use(
    http.get(`${apiBaseUrl}/api/v1/devices/${device.id}`, () =>
      HttpResponse.json(device, { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/clients/${device.clientId}`, () =>
      HttpResponse.json(createClientResponse(), { headers: { ETag: '"1"' } }),
    ),
  );
}

describe("DeviceClientName", () => {
  it("links to the client that owns the device", async () => {
    mockDeviceAndClient();
    renderWithProviders(
      <MemoryRouter>
        <DeviceClientName deviceId={device.id} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("link", { name: "Piekarnia Kowalski" })).toHaveAttribute(
      "href",
      `/clients/${device.clientId}`,
    );
  });

  it("shows the client name as plain text when links are not allowed", async () => {
    mockDeviceAndClient();
    renderWithProviders(
      <MemoryRouter>
        <DeviceClientName deviceId={device.id} linked={false} />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Piekarnia Kowalski")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
