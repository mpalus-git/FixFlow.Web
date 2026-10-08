import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { WorkOrderEventList } from "@/features/work-orders/components/WorkOrderEventList";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";
import { createWorkOrderEventResponse } from "@/test/workOrderFixtures";

type WorkOrderEventResponse = components["schemas"]["WorkOrderEventResponse"];
type WorkOrderEventType = components["schemas"]["WorkOrderEventType"];

const workOrderId = "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a";
const eventsUrl = `${apiBaseUrl}/api/v1/work-orders/${workOrderId}/events`;
const technicianId = "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10";

function event(
  index: number,
  type: WorkOrderEventType,
  overrides: Partial<WorkOrderEventResponse> = {},
): WorkOrderEventResponse {
  return createWorkOrderEventResponse({
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    type,
    occurredAt: `2026-07-1${String(index)}T08:00:00Z`,
    ...overrides,
  });
}

function renderEvents(events: WorkOrderEventResponse[]) {
  server.use(http.get(eventsUrl, () => HttpResponse.json(events)));
  renderWithProviders(<WorkOrderEventList workOrderId={workOrderId} />);
}

function items() {
  return within(screen.getByRole("list", { name: "Historia zmian zlecenia" })).getAllByRole(
    "listitem",
  );
}

function item(index: number) {
  const listItem = items()[index];
  if (listItem === undefined) {
    throw new Error(`No event at position ${String(index)}`);
  }
  return within(listItem);
}

describe("WorkOrderEventList", () => {
  it("lists every kind of change in order with its time in Warsaw and author", async () => {
    const assigned = { technicianId, technicianName: "Jan Kowalski" };
    renderEvents([
      event(0, "Created"),
      event(1, "Updated"),
      event(2, "Assigned", assigned),
      event(3, "Reassigned", assigned),
      event(4, "Unassigned"),
      event(5, "Assigned", assigned),
      event(6, "Started", assigned),
      event(7, "Completed", assigned),
      event(8, "Invoiced", { ...assigned, actorId: null, actorName: null }),
    ]);

    await screen.findByText("Utworzono zlecenie");
    const labels = [
      "Utworzono zlecenie",
      "Zmieniono dane zlecenia",
      "Przypisano technika",
      "Przeniesiono zlecenie",
      "Odpięto technika",
      "Przypisano technika",
      "Rozpoczęto realizację",
      "Zakończono zlecenie",
      "Zafakturowano zlecenie",
    ];
    expect(items()).toHaveLength(labels.length);
    labels.forEach((label, index) => {
      expect(item(index).getByText(label)).toBeInTheDocument();
    });
    expect(item(0).getByText("10.07.2026 10:00")).toBeInTheDocument();
    expect(item(0).getByText("Anna Wiśniewska")).toBeInTheDocument();
    expect(item(8).getByText("zmiana systemowa")).toBeInTheDocument();
  });

  it("names the technician only when the work order is assigned or moved", async () => {
    const assigned = { technicianId, technicianName: "Jan Kowalski" };
    renderEvents([
      event(0, "Created"),
      event(1, "Assigned", assigned),
      event(2, "Started", assigned),
    ]);

    await screen.findByText("Przypisano technika");
    expect(item(1).getByText("Jan Kowalski")).toBeInTheDocument();
    expect(item(2).queryByText("Jan Kowalski")).not.toBeInTheDocument();
  });

  it("shows the due date when created and again only when a change moved it", async () => {
    renderEvents([
      event(0, "Created", { dueDate: "2026-07-15T08:00:00Z" }),
      event(1, "Updated", { dueDate: "2026-07-15T08:00:00Z" }),
      event(2, "Updated", { dueDate: "2026-07-16T12:30:00Z" }),
    ]);

    await screen.findByText("Utworzono zlecenie");
    expect(item(0).getByText("Termin:")).toBeInTheDocument();
    expect(item(0).getByText("15.07.2026 10:00")).toBeInTheDocument();
    expect(item(1).queryByText(/Termin:/i)).not.toBeInTheDocument();
    expect(item(2).getByText("Nowy termin:")).toBeInTheDocument();
    expect(item(2).getByText("16.07.2026 14:30")).toBeInTheDocument();
  });

  it("explains when no change has been recorded", async () => {
    renderEvents([]);

    expect(await screen.findByText("Brak zapisanych zmian")).toBeInTheDocument();
  });

  it("offers a retry when the history cannot be loaded", async () => {
    let attempts = 0;
    server.use(
      http.get(eventsUrl, () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ status: 500, title: "Server error" }, { status: 500 })
          : HttpResponse.json([event(0, "Created")]);
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<WorkOrderEventList workOrderId={workOrderId} />);

    await user.click(await screen.findByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByText("Utworzono zlecenie")).toBeInTheDocument();
  });
});
