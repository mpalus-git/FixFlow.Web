import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { WorkOrderFilters } from "@/features/work-orders/components/WorkOrderFilters";
import type { WorkOrderListFilters } from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

type UserPage = components["schemas"]["PagedResponseOfUserResponse"];

const activeTechnicianId = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const inactiveTechnicianId = "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e";

const noFilters: WorkOrderListFilters = {
  status: null,
  technicianId: null,
  dueFrom: null,
  dueTo: null,
  overdueOnly: false,
};

function mockTechnicians() {
  const userPage: UserPage = {
    items: [
      {
        id: activeTechnicianId,
        email: "anna@fixflow.test",
        fullName: "Anna Nowak",
        role: "Technician",
        isActive: true,
      },
      {
        id: inactiveTechnicianId,
        email: "piotr@fixflow.test",
        fullName: "Piotr Zieliński",
        role: "Technician",
        isActive: false,
      },
    ],
    page: 1,
    pageSize: 100,
    totalCount: 2,
  };
  server.use(http.get(`${apiBaseUrl}/api/v1/users`, () => HttpResponse.json(userPage)));
}

function renderFilters(filters: WorkOrderListFilters, showTechnicianFilter = true) {
  const onChange = vi.fn<(filters: Partial<WorkOrderListFilters>) => void>();
  renderWithProviders(
    <WorkOrderFilters
      filters={filters}
      onChange={onChange}
      showTechnicianFilter={showTechnicianFilter}
      canClear={false}
      onClear={vi.fn()}
    />,
  );
  return onChange;
}

describe("WorkOrderFilters", () => {
  it("filters by the chosen status", async () => {
    const user = userEvent.setup();
    const onChange = renderFilters(noFilters, false);

    await user.selectOptions(screen.getByLabelText("Status"), "W realizacji");

    expect(onChange).toHaveBeenCalledWith({ status: "InProgress" });
  });

  it("offers active and deactivated technicians and filters by the chosen one", async () => {
    mockTechnicians();
    const user = userEvent.setup();
    const onChange = renderFilters(noFilters);
    const technicianSelect = screen.getByLabelText("Technik");

    await screen.findByRole("option", { name: "piotr@fixflow.test (nieaktywny)" });
    await user.selectOptions(technicianSelect, "anna@fixflow.test");

    expect(onChange).toHaveBeenCalledWith({ technicianId: activeTechnicianId });
  });

  it("clears the technician filter when all technicians are chosen", async () => {
    mockTechnicians();
    const user = userEvent.setup();
    const onChange = renderFilters({ ...noFilters, technicianId: activeTechnicianId });

    await screen.findByRole("option", { name: "anna@fixflow.test" });
    await user.selectOptions(screen.getByLabelText("Technik"), "Wszyscy technicy");

    expect(onChange).toHaveBeenCalledWith({ technicianId: null });
  });

  it("does not show the technician filter or ask for technicians when it is hidden", () => {
    renderFilters(noFilters, false);

    expect(screen.queryByLabelText("Technik")).not.toBeInTheDocument();
  });

  it("clears the end of the due date range when the new start is after it", () => {
    const onChange = renderFilters({ ...noFilters, dueFrom: "2026-10-01", dueTo: "2026-10-03" });

    fireEvent.change(screen.getByLabelText("Termin od"), { target: { value: "2026-10-05" } });

    expect(onChange).toHaveBeenCalledWith({ dueFrom: "2026-10-05", dueTo: null });
  });

  it("filters only overdue work orders when the checkbox is ticked", async () => {
    const user = userEvent.setup();
    const onChange = renderFilters(noFilters, false);

    await user.click(screen.getByRole("checkbox", { name: "Tylko po terminie" }));

    expect(onChange).toHaveBeenCalledWith({ overdueOnly: true });
  });
});
