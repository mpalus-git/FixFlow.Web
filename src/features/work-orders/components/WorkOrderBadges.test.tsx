import { render, screen } from "@testing-library/react";
import { WorkOrderPriorityBadge } from "@/features/work-orders/components/WorkOrderPriorityBadge";
import { WorkOrderStatusBadge } from "@/features/work-orders/components/WorkOrderStatusBadge";
import { changeLanguage } from "@/shared/i18n/i18n";

describe("work order badges", () => {
  afterEach(async () => {
    await changeLanguage("pl");
    localStorage.clear();
  });

  it.each([
    ["New", "Nowe"],
    ["Assigned", "Przypisane"],
    ["InProgress", "W realizacji"],
    ["Completed", "Zakończone"],
    ["Invoiced", "Zafakturowane"],
  ] as const)("names the %s status in Polish", (status, label) => {
    render(<WorkOrderStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    ["Low", "Niski"],
    ["Normal", "Normalny"],
    ["High", "Wysoki"],
    ["Critical", "Krytyczny"],
  ] as const)("names the %s priority in Polish", (priority, label) => {
    render(<WorkOrderPriorityBadge priority={priority} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("names the status in English after switching the language", async () => {
    await changeLanguage("en");
    render(<WorkOrderStatusBadge status="InProgress" />);

    expect(screen.getByText("In progress")).toBeInTheDocument();
  });
});
