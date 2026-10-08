import { render, screen, within } from "@testing-library/react";
import { WorkOrderStatusTimeline } from "@/features/work-orders/components/WorkOrderStatusTimeline";
import { latestAssignmentTime } from "@/features/work-orders/workOrderRules";
import { createWorkOrderEventResponse, createWorkOrderResponse } from "@/test/workOrderFixtures";

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

  it("shows when the technician was last assigned according to the event history", () => {
    const events = [
      createWorkOrderEventResponse({ type: "Created", occurredAt: "2026-07-10T08:00:00Z" }),
      createWorkOrderEventResponse({ type: "Assigned", occurredAt: "2026-07-11T07:00:00Z" }),
      createWorkOrderEventResponse({ type: "Reassigned", occurredAt: "2026-07-12T09:30:00Z" }),
      createWorkOrderEventResponse({ type: "Started", occurredAt: "2026-07-13T06:00:00Z" }),
    ];
    render(
      <WorkOrderStatusTimeline
        workOrder={createWorkOrderResponse({ status: "InProgress" })}
        assignedAt={latestAssignmentTime(events)}
      />,
    );

    expect(steps()[1]).toHaveTextContent("Przypisane12.07.2026 11:30");
  });

  it("leaves the assignment time empty when the history has no assignment", () => {
    expect(latestAssignmentTime([createWorkOrderEventResponse({ type: "Created" })])).toBeNull();
  });

  it("tells screen readers which steps are completed and which are still pending", () => {
    render(
      <WorkOrderStatusTimeline workOrder={createWorkOrderResponse({ status: "InProgress" })} />,
    );

    const [created, assigned, inProgress, completed, invoiced] = steps();
    expect(created).toHaveTextContent("etap ukończony");
    expect(assigned).toHaveTextContent("etap ukończony");
    expect(inProgress).not.toHaveTextContent(/etap/);
    expect(completed).toHaveTextContent("etap oczekuje");
    expect(invoiced).toHaveTextContent("etap oczekuje");
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
