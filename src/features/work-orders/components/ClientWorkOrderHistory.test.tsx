import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router";
import { ClientWorkOrderHistory } from "@/features/work-orders";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

const workOrdersUrl = `${apiBaseUrl}/api/v1/work-orders`;
const clientId = "3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f";

function renderHistory(initialEntry = `/clients/${clientId}`) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ClientWorkOrderHistory clientId={clientId} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockHistory(workOrderPage: WorkOrderPage) {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(workOrdersUrl, ({ request }) => {
      requests.push(new URL(request.url).searchParams);
      return HttpResponse.json(workOrderPage);
    }),
  );
  return requests;
}

describe("ClientWorkOrderHistory", () => {
  it("asks for the work orders of the client, newest due date first", async () => {
    const requests = mockHistory({
      items: [createWorkOrderListItem()],
      page: 3,
      pageSize: 10,
      totalCount: 25,
    });
    renderHistory(`/clients/${clientId}?ordersPage=3`);

    expect(await screen.findByText("Strona 3 z 3")).toBeInTheDocument();
    expect(Object.fromEntries(requests[0] ?? [])).toEqual({
      clientId,
      page: "3",
      pageSize: "10",
      sortBy: "DueDate",
      sortDirection: "Desc",
    });
  });

  it("shows the due date in Warsaw time with the device, priority, status and technician", async () => {
    mockHistory({ items: [createWorkOrderListItem()], page: 1, pageSize: 10, totalCount: 1 });
    renderHistory();

    const row = (await screen.findByText("16.07.2026 00:30")).closest("tr");
    const cells = within(row ?? document.body);

    expect(cells.getByText("SN-2024-0001")).toBeInTheDocument();
    expect(cells.getByText("Vitodens 200-W")).toBeInTheDocument();
    expect(cells.getByText("Wysoki")).toBeInTheDocument();
    expect(cells.getByText("Przypisane")).toBeInTheDocument();
    expect(cells.getByText("technician@fixflow.test")).toBeInTheDocument();
    expect(cells.queryByText("Po terminie")).toBeNull();
  });

  it("marks overdue and unassigned work orders", async () => {
    mockHistory({
      items: [
        createWorkOrderListItem({
          status: "New",
          technicianId: null,
          technicianEmail: null,
          isOverdue: true,
        }),
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1,
    });
    renderHistory();

    expect(await screen.findByText("Po terminie")).toBeInTheDocument();
    expect(screen.getByText("Nieprzypisane")).toBeInTheDocument();
    expect(screen.getByText("Nowe")).toBeInTheDocument();
  });

  it("says when the client has no work orders", async () => {
    mockHistory({ items: [], page: 1, pageSize: 10, totalCount: 0 });
    renderHistory();

    expect(
      await screen.findByRole("heading", { name: "Klient nie ma jeszcze zleceń" }),
    ).toBeInTheDocument();
  });
});
