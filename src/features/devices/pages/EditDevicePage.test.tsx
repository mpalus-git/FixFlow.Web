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

type DeviceResponse = components["schemas"]["DeviceResponse"];
type UpdateDeviceRequest = components["schemas"]["UpdateDeviceRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const device = createDeviceResponse();
const deviceUrl = `${apiBaseUrl}/api/v1/devices/${device.id}`;
const editPath = `/devices/${device.id}/edit`;

function mockStoredDevice(initial: DeviceResponse = device) {
  const stored = { device: initial, etag: '"1"' };
  server.use(
    http.get(deviceUrl, () => HttpResponse.json(stored.device, { headers: { ETag: stored.etag } })),
    http.get(`${apiBaseUrl}/api/v1/clients/${device.clientId}`, () =>
      HttpResponse.json(createClientResponse(), { headers: { ETag: '"1"' } }),
    ),
  );
  mockEmptyClientCardLists();
  return stored;
}

describe("EditDevicePage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("saves the changes with the edited version and returns to the device card", async () => {
    const stored = mockStoredDevice();
    const receivedIfMatch: (string | null)[] = [];
    server.use(
      http.put<never, UpdateDeviceRequest>(deviceUrl, async ({ request }) => {
        receivedIfMatch.push(request.headers.get("If-Match"));
        stored.device = { ...device, ...(await request.json()) };
        stored.etag = '"2"';
        return HttpResponse.json(stored.device, { headers: { ETag: stored.etag } });
      }),
    );
    const user = userEvent.setup();
    const router = renderApp(editPath);

    const modelInput = await screen.findByLabelText("Model");
    await user.clear(modelInput);
    await user.type(modelInput, "Vitodens 300-W");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(await screen.findByText("Viessmann Vitodens 300-W")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/devices/${device.id}`);
    expect(receivedIfMatch).toEqual(['"1"']);
  });

  it("offers to load the current version after a conflict", async () => {
    const stored = mockStoredDevice();
    server.use(
      http.put(deviceUrl, () => {
        stored.device = { ...device, manufacturer: "Vaillant" };
        stored.etag = '"2"';
        const problem: ProblemDetails = { status: 412, title: "Precondition Failed" };
        return HttpResponse.json(problem, { status: 412 });
      }),
    );
    const user = userEvent.setup();
    renderApp(editPath);

    await user.type(await screen.findByLabelText("Model"), " Plus");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));
    await user.click(await screen.findByRole("button", { name: "Wczytaj aktualną wersję" }));

    expect(await screen.findByDisplayValue("Vaillant")).toBeInTheDocument();
    expect(screen.getByLabelText("Model")).toHaveValue("Vitodens 200-W");
  });

  it("shows a taken serial number at the field", async () => {
    mockStoredDevice();
    server.use(
      http.put(deviceUrl, () => {
        const problem: ProblemDetails = {
          status: 409,
          title: "Conflict",
          errorCode: "Device.DuplicateSerialNumber",
        };
        return HttpResponse.json(problem, { status: 409 });
      }),
    );
    const user = userEvent.setup();
    renderApp(editPath);

    const serialInput = await screen.findByLabelText(/Numer seryjny/);
    await user.clear(serialInput);
    await user.type(serialInput, "SN-2024-0002");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(
      await screen.findByText(/Urządzenie o tym numerze seryjnym już istnieje/),
    ).toBeInTheDocument();
    expect(serialInput).toHaveAttribute("aria-invalid", "true");
  });

  it("does not allow editing an archived device", async () => {
    mockStoredDevice({ ...device, archivedAt: "2026-09-20T10:00:00Z" });
    renderApp(editPath);

    expect(await screen.findByRole("note")).toHaveTextContent("Urządzenie jest zarchiwizowane");
    expect(screen.getByLabelText("Model")).toBeDisabled();
  });
});
