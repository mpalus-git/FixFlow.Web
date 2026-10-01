import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceResponse } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { createUser, signInAs } from "@/test/signedInUser";
import { createServiceEntryResponse, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const device = createDeviceResponse();
const otherTechnicianId = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

function mockDetails(workOrder: WorkOrderResponse) {
  const userListRequests: Request[] = [];
  const userPage: UserPage = {
    items: [
      { id: otherTechnicianId, email: "anna@fixflow.test", role: "Technician", isActive: true },
    ],
    page: 1,
    pageSize: 100,
    totalCount: 1,
  };
  server.use(
    http.get(`${apiBaseUrl}/api/v1/work-orders/${workOrder.id}`, () =>
      HttpResponse.json(workOrder, { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/work-orders/${workOrder.id}/service-entries`, () =>
      HttpResponse.json([
        createServiceEntryResponse({ technicianId: workOrder.technicianId ?? "" }),
      ]),
    ),
    http.get(`${apiBaseUrl}/api/v1/devices/${device.id}`, () =>
      HttpResponse.json(device, { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/clients/${device.clientId}`, () =>
      HttpResponse.json(createClientResponse(), { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/users`, ({ request }) => {
      userListRequests.push(request);
      return HttpResponse.json(userPage);
    }),
  );
  return userListRequests;
}

describe("WorkOrderDetailsPage", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the work order with its device, client, technician, progress and entries", async () => {
    signInAs("Dispatcher");
    const workOrder = createWorkOrderResponse({
      status: "Assigned",
      technicianId: otherTechnicianId,
      dueDate: "2026-10-05T08:00:00Z",
    });
    mockDetails(workOrder);
    renderApp(`/work-orders/${workOrder.id}`);

    expect(
      await screen.findByRole("heading", { name: "Szczegóły zlecenia", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "SN-2024-0001 · Viessmann Vitodens 200-W" }),
    ).toHaveAttribute("href", `/devices/${device.id}`);
    expect(await screen.findByRole("link", { name: "Piekarnia Kowalski" })).toBeInTheDocument();
    expect(await screen.findAllByText("anna@fixflow.test")).toHaveLength(2);
    expect(screen.getByText("05.10.2026 10:00")).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Przypisane");
    expect(screen.getByText("Wymieniono czujnik ciśnienia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edytuj" })).toHaveAttribute(
      "href",
      `/work-orders/${workOrder.id}/edit`,
    );
  });

  it("shows the technician their own work order read-only without links to other areas", async () => {
    signInAs("Technician");
    const workOrder = createWorkOrderResponse({
      status: "InProgress",
      technicianId: createUser("Technician").id,
      startedAt: "2026-07-14T06:45:00Z",
    });
    const userListRequests = mockDetails(workOrder);
    renderApp(`/my-work-orders/${workOrder.id}`);

    expect(await screen.findByText("Piekarnia Kowalski")).toBeInTheDocument();
    expect(screen.getByText("SN-2024-0001 · Viessmann Vitodens 200-W")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /SN-2024-0001|Piekarnia/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("technician@fixflow.test")).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Edytuj" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć" })).toHaveAttribute("href", "/my-work-orders");
    expect(userListRequests).toHaveLength(0);
  });

  it("does not offer editing a completed work order", async () => {
    signInAs("Dispatcher");
    const workOrder = createWorkOrderResponse({
      status: "Completed",
      technicianId: otherTechnicianId,
      completedAt: "2026-07-14T09:00:00Z",
    });
    mockDetails(workOrder);
    renderApp(`/work-orders/${workOrder.id}`);

    expect(await screen.findByText("Wymieniono czujnik ciśnienia")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edytuj" })).not.toBeInTheDocument();
  });

  it("shows the not found page for a work order that does not exist", async () => {
    signInAs("Dispatcher");
    const workOrder = createWorkOrderResponse();
    server.use(
      http.get(`${apiBaseUrl}/api/v1/work-orders/${workOrder.id}`, () => {
        const problem: ProblemDetails = { status: 404, title: "Not Found" };
        return HttpResponse.json(problem, { status: 404 });
      }),
    );
    renderApp(`/work-orders/${workOrder.id}`);

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
  });
});
