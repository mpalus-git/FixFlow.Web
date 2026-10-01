import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceListItem } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createWorkOrderResponse } from "@/test/workOrderFixtures";

type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];
type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type CreateWorkOrderRequest = components["schemas"]["CreateWorkOrderRequest"];

const client = createClientResponse();
const device = createDeviceListItem();

function mockApi() {
  const clientPage: ClientPage = { items: [client], page: 1, pageSize: 100, totalCount: 1 };
  const devicePage: DevicePage = { items: [device], page: 1, pageSize: 100, totalCount: 1 };
  const userPage: UserPage = { items: [], page: 1, pageSize: 100, totalCount: 0 };
  const workOrderPage: WorkOrderPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
  const createdBodies: CreateWorkOrderRequest[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/clients`, () => HttpResponse.json(clientPage)),
    http.get(`${apiBaseUrl}/api/v1/devices`, () => HttpResponse.json(devicePage)),
    http.get(`${apiBaseUrl}/api/v1/users`, () => HttpResponse.json(userPage)),
    http.get(`${apiBaseUrl}/api/v1/work-orders`, () => HttpResponse.json(workOrderPage)),
    http.post<never, CreateWorkOrderRequest>(
      `${apiBaseUrl}/api/v1/work-orders`,
      async ({ request }) => {
        createdBodies.push(await request.json());
        return HttpResponse.json(createWorkOrderResponse(), {
          status: 201,
          headers: { ETag: '"1"' },
        });
      },
    ),
  );
  return createdBodies;
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  await screen.findByRole("option", { name: client.name });
  await user.selectOptions(screen.getByLabelText("Klient"), client.name);
  await screen.findByRole("option", { name: /SN-2024-0001/ });
  await user.selectOptions(screen.getByLabelText("Urządzenie"), device.id);
  await user.type(screen.getByLabelText("Opis usterki"), "Kocioł nie grzeje wody");
  fireEvent.change(screen.getByLabelText("Termin"), { target: { value: "2030-01-15T10:00" } });
  await user.click(screen.getByRole("button", { name: "Utwórz zlecenie" }));
}

describe("CreateWorkOrderPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("creates the work order with the due date in UTC and opens its details", async () => {
    const createdBodies = mockApi();
    const router = renderApp("/work-orders/new");

    await fillAndSubmit();

    expect(await screen.findByText("Utworzono zlecenie.")).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe(`/work-orders/${createWorkOrderResponse().id}`);
    });
    expect(createdBodies).toEqual([
      {
        deviceId: device.id,
        description: "Kocioł nie grzeje wody",
        priority: "Normal",
        dueDate: "2030-01-15T09:00:00.000Z",
      },
    ]);
  });

  it("cancels back to the filtered list it was opened from", async () => {
    mockApi();
    const router = renderApp("/work-orders?status=New");

    const user = userEvent.setup();
    await user.click(await screen.findByRole("link", { name: "Nowe zlecenie" }));
    await user.click(await screen.findByRole("link", { name: "Anuluj" }));

    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe("/work-orders");
    });
    expect(router.state.location.search).toBe("?status=New");
  });
});
