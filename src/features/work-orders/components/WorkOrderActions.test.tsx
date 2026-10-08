import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import type { Role } from "@/shared/session/currentUser";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceResponse } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createServiceEntryResponse, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];
type ServiceEntryResponse = components["schemas"]["ServiceEntryResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const technicianId = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const device = createDeviceResponse();

function mockWorkOrder(initial: WorkOrderResponse, entries: ServiceEntryResponse[] = []) {
  const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${initial.id}`;
  const serverState = { workOrder: initial, version: 1 };
  const respond = () =>
    HttpResponse.json(serverState.workOrder, {
      headers: { ETag: `"${String(serverState.version)}"` },
    });
  const change = (changes: Partial<WorkOrderResponse>) => {
    serverState.workOrder = { ...serverState.workOrder, ...changes };
    serverState.version += 1;
    return respond();
  };
  const userPage: UserPage = {
    items: [
      {
        id: technicianId,
        email: "anna@fixflow.test",
        fullName: "Anna Nowak",
        role: "Technician",
        isActive: true,
      },
    ],
    page: 1,
    pageSize: 100,
    totalCount: 1,
  };
  server.use(
    http.get(workOrderUrl, respond),
    http.get(`${workOrderUrl}/service-entries`, () => HttpResponse.json(entries)),
    http.get(`${workOrderUrl}/events`, () => HttpResponse.json([])),
    http.post(`${workOrderUrl}/unassign`, () => change({ status: "New", technicianId: null })),
    http.post(`${workOrderUrl}/invoice`, () =>
      change({ status: "Invoiced", invoicedAt: "2026-10-01T10:00:00Z" }),
    ),
    http.get(`${apiBaseUrl}/api/v1/devices/${device.id}`, () =>
      HttpResponse.json(device, { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/clients/${device.clientId}`, () =>
      HttpResponse.json(createClientResponse(), { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/users`, () => HttpResponse.json(userPage)),
  );
  return {
    workOrderUrl,
    changeOnServer: (changes: Partial<WorkOrderResponse>) => {
      change(changes);
    },
  };
}

async function openDetails(workOrder: WorkOrderResponse, role: Role = "Dispatcher") {
  signInAs(role);
  renderApp(`${role === "Technician" ? "/my-work-orders" : "/work-orders"}/${workOrder.id}`);
  await screen.findByRole("heading", { name: "Zlecenie ZL/2026/0042", level: 1 });
}

function actionButtonNames() {
  return [
    "Przypisz technika",
    "Zmień technika",
    "Odepnij technika",
    "Zakończ awaryjnie",
    "Zafakturuj",
  ].filter((name) => screen.queryByRole("button", { name }) !== null);
}

describe("WorkOrderActions", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it.each([
    ["New", ["Przypisz technika"]],
    ["Assigned", ["Zmień technika", "Odepnij technika"]],
    ["Completed", ["Zafakturuj"]],
    ["Invoiced", []],
  ] as const)(
    "offers the dispatcher only the actions allowed in the %s status",
    async (status, names) => {
      const workOrder = createWorkOrderResponse({ status, technicianId });
      mockWorkOrder(workOrder);
      await openDetails(workOrder);

      expect(actionButtonNames()).toEqual(names);
    },
  );

  it("offers no actions to the technician", async () => {
    const workOrder = createWorkOrderResponse({ status: "Assigned", technicianId });
    mockWorkOrder(workOrder);
    await openDetails(workOrder, "Technician");

    expect(actionButtonNames()).toEqual([]);
  });

  it("explains why a work order without entries cannot be completed", async () => {
    const workOrder = createWorkOrderResponse({ status: "InProgress", technicianId });
    mockWorkOrder(workOrder);
    await openDetails(workOrder);

    expect(
      await screen.findByText("Wymaga co najmniej jednego wpisu serwisowego."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zakończ awaryjnie" })).toBeDisabled();
  });

  it("allows completing a work order that has service entries", async () => {
    const workOrder = createWorkOrderResponse({ status: "InProgress", technicianId });
    mockWorkOrder(workOrder, [createServiceEntryResponse({ technicianId })]);
    await openDetails(workOrder);

    expect(await screen.findByText("Wymieniono czujnik ciśnienia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zakończ awaryjnie" })).toBeEnabled();
  });

  it("unassigns the technician and shows the work order as new", async () => {
    const workOrder = createWorkOrderResponse({ status: "Assigned", technicianId });
    mockWorkOrder(workOrder);
    await openDetails(workOrder);

    await userEvent.setup().click(screen.getByRole("button", { name: "Odepnij technika" }));

    expect(await screen.findByText("Odpięto technika.")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Przypisz technika" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Nowe");
  });

  it("invoices a completed work order after confirmation", async () => {
    const workOrder = createWorkOrderResponse({ status: "Completed", technicianId });
    mockWorkOrder(workOrder);
    await openDetails(workOrder);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Zafakturuj" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Zafakturować zlecenie?" });
    await user.click(within(dialog).getByRole("button", { name: "Zafakturuj" }));

    expect(await screen.findByText("Zafakturowano zlecenie.")).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Zafakturowane");
    expect(screen.queryByRole("button", { name: "Zafakturuj" })).not.toBeInTheDocument();
  });

  it("shows the current state when the status changed in the meantime", async () => {
    const workOrder = createWorkOrderResponse({ status: "Completed", technicianId });
    const { workOrderUrl, changeOnServer } = mockWorkOrder(workOrder);
    server.use(
      http.post(`${workOrderUrl}/invoice`, () => {
        changeOnServer({ status: "Invoiced", invoicedAt: "2026-10-01T10:00:00Z" });
        const problem: ProblemDetails = {
          status: 409,
          title: "Conflict",
          errorCode: "WorkOrder.InvalidStatusTransition",
        };
        return HttpResponse.json(problem, { status: 409 });
      }),
    );
    await openDetails(workOrder);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Zafakturuj" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Zafakturuj" }));

    expect(
      await screen.findByText(
        "Status zlecenia zmienił się w międzyczasie i ta akcja nie jest już dostępna.",
      ),
    ).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Zafakturowane");
    });
  });
});
