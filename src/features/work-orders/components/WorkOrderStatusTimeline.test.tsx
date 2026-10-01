import { render, screen, within } from "@testing-library/react";
import { WorkOrderStatusTimeline } from "@/features/work-orders/components/WorkOrderStatusTimeline";
import { createWorkOrderResponse } from "@/test/workOrderFixtures";

function steps() {
  return within(screen.getByRole("list", { name: "Przebieg zlecenia" })).getAllByRole("listitem");
}

describe("WorkOrderStatusTimeline", () => {
  it("marks the current status and shows when the reached statuses began in Warsaw time", () => {
    render(
      <WorkOrderStatusTimeline
        workOrder={createWorkOrderResponse({
          status: "InProgress",
          createdAt: "2026-07-10T08:00:00Z",
          startedAt: "2026-07-14T06:45:00Z",
        })}
      />,
    );

    const [created, assigned, inProgress, completed] = steps();
    expect(inProgress).toHaveAttribute("aria-current", "step");
    expect(inProgress).toHaveTextContent("W realizacji14.07.2026 08:45");
    expect(created).toHaveTextContent("Nowe10.07.2026 10:00");
    expect(assigned).toHaveTextContent("Przypisane");
    expect(assigned).not.toHaveAttribute("aria-current");
    expect(completed).toHaveTextContent("Zakończone");
    expect(completed).not.toHaveTextContent(/\d{2}:\d{2}/);
  });

  it("ends on the invoiced status of a closed work order", () => {
    render(
      <WorkOrderStatusTimeline
        workOrder={createWorkOrderResponse({
          status: "Invoiced",
          startedAt: "2026-07-14T06:45:00Z",
          completedAt: "2026-07-14T09:00:00Z",
          invoicedAt: "2026-07-20T12:00:00Z",
        })}
      />,
    );

    const invoiced = steps().at(-1);
    expect(invoiced).toHaveAttribute("aria-current", "step");
    expect(invoiced).toHaveTextContent("Zafakturowane20.07.2026 14:00");
  });
});
