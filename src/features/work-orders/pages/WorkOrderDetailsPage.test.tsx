import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { createUser, signInAs } from "@/test/signedInUser";
import { createServiceEntryResponse, createWorkOrderResponse } from "@/test/workOrderFixtures";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const otherTechnicianId = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

function mockDetails(workOrder: WorkOrderResponse) {
  const userListRequests: Request[] = [];
  const relatedResourceRequests: string[] = [];
  const userPage: UserPage = {
    items: [
      {
        id: otherTechnicianId,
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
    http.get(`${apiBaseUrl}/api/v1/work-orders/${workOrder.id}`, () =>
      HttpResponse.json(workOrder, { headers: { ETag: '"1"' } }),
    ),
    http.get(`${apiBaseUrl}/api/v1/work-orders/${workOrder.id}/service-entries`, () =>
      HttpResponse.json([
        createServiceEntryResponse({ technicianId: workOrder.technicianId ?? "" }),
      ]),
    ),
    ...["devices", "clients", "parts"].map((resource) =>
      http.get(`${apiBaseUrl}/api/v1/${resource}/:id`, ({ request }) => {
        relatedResourceRequests.push(new URL(request.url).pathname);
        return new HttpResponse(null, { status: 500 });
      }),
    ),
    http.get(`${apiBaseUrl}/api/v1/users`, ({ request }) => {
      userListRequests.push(request);
      return HttpResponse.json(userPage);
    }),
  );
  return { userListRequests, relatedResourceRequests };
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
      technicianEmail: "anna@fixflow.test",
      technicianName: "Anna Nowak",
      dueDate: "2026-10-05T08:00:00Z",
    });
    const { relatedResourceRequests } = mockDetails(workOrder);
    renderApp(`/work-orders/${workOrder.id}`);

    expect(
      await screen.findByRole("heading", { name: "Zlecenie ZL/2026/0042", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "SN-2024-0001 · Vitodens 200-W" }),
    ).toHaveAttribute("href", `/devices/${workOrder.deviceId}`);
    expect(screen.getByRole("link", { name: "Piekarnia Kowalski" })).toHaveAttribute(
      "href",
      `/clients/${workOrder.clientId}`,
    );
    expect(await screen.findByText("Anna Nowak")).toBeInTheDocument();
    expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
    expect(screen.getByText("05.10.2026 10:00")).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Przypisane");
    expect(screen.getByText("Wymieniono czujnik ciśnienia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edytuj" })).toHaveAttribute(
      "href",
      `/work-orders/${workOrder.id}/edit`,
    );
    expect(relatedResourceRequests).toEqual([]);
  });

  it("shows the technician their own work order read-only without links to other areas", async () => {
    signInAs("Technician");
    const workOrder = createWorkOrderResponse({
      status: "InProgress",
      technicianId: createUser("Technician").id,
      technicianEmail: "technician@fixflow.test",
      technicianName: "Jan Kowalski",
      startedAt: "2026-07-14T06:45:00Z",
    });
    const { userListRequests, relatedResourceRequests } = mockDetails(workOrder);
    renderApp(`/my-work-orders/${workOrder.id}`);

    expect(await screen.findByText("Piekarnia Kowalski")).toBeInTheDocument();
    expect(screen.getByText("SN-2024-0001 · Vitodens 200-W")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /SN-2024-0001|Piekarnia/ })).not.toBeInTheDocument();
    expect(await screen.findByText("Wymieniono czujnik ciśnienia")).toBeInTheDocument();
    expect(screen.getAllByText("Jan Kowalski")).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Edytuj" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć" })).toHaveAttribute("href", "/my-work-orders");
    expect(userListRequests).toHaveLength(0);
    expect(relatedResourceRequests).toEqual([]);
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
