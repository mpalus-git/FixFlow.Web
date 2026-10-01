import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import { WorkOrdersTable } from "@/features/work-orders/components/WorkOrdersTable";
import type { WorkOrderSort } from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

function renderTable(sort: WorkOrderSort, showTechnician = true) {
  const onSortChange = vi.fn<(sort: WorkOrderSort) => void>();
  render(
    <MemoryRouter>
      <WorkOrdersTable
        workOrders={[createWorkOrderListItem()]}
        isUpdating={false}
        sort={sort}
        onSortChange={onSortChange}
        showTechnician={showTechnician}
        showActions={false}
        detailsBasePath="/work-orders"
      />
    </MemoryRouter>,
  );
  return onSortChange;
}

describe("WorkOrdersTable", () => {
  it("shows the client next to the device and marks the column the list is sorted by", () => {
    renderTable({ sortBy: "Priority", sortDirection: "Desc" });

    expect(screen.getByRole("cell", { name: "Piekarnia Kowalski" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Priorytet" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(screen.getByRole("columnheader", { name: "Termin" })).not.toHaveAttribute("aria-sort");
  });

  it("links the due date to the work order details", () => {
    renderTable({ sortBy: "DueDate", sortDirection: "Asc" });

    expect(screen.getByRole("link", { name: "16.07.2026 00:30" })).toHaveAttribute(
      "href",
      `/work-orders/${createWorkOrderListItem().id}`,
    );
  });

  it("sorts ascending by a newly chosen column", async () => {
    const user = userEvent.setup();
    const onSortChange = renderTable({ sortBy: "DueDate", sortDirection: "Asc" });

    await user.click(screen.getByRole("button", { name: "Klient" }));

    expect(onSortChange).toHaveBeenCalledWith({ sortBy: "ClientName", sortDirection: "Asc" });
  });

  it("reverses the direction when the sorted column is chosen again", async () => {
    const user = userEvent.setup();
    const onSortChange = renderTable({ sortBy: "DueDate", sortDirection: "Asc" });

    await user.click(screen.getByRole("button", { name: "Termin" }));

    expect(onSortChange).toHaveBeenCalledWith({ sortBy: "DueDate", sortDirection: "Desc" });
  });

  it("does not offer sorting by the device or the description", () => {
    renderTable({ sortBy: "DueDate", sortDirection: "Asc" });

    expect(screen.queryByRole("button", { name: "Urządzenie" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Opis usterki" })).not.toBeInTheDocument();
  });

  it("hides the technician column when the list belongs to one technician", () => {
    renderTable({ sortBy: "DueDate", sortDirection: "Asc" }, false);

    expect(screen.queryByRole("columnheader", { name: "Technik" })).not.toBeInTheDocument();
  });
});
