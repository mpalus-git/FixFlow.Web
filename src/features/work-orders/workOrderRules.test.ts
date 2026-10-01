import {
  availableWorkOrderActions,
  canEditWorkOrder,
  type WorkOrderActionAvailability,
} from "@/features/work-orders/workOrderRules";

const none: WorkOrderActionAvailability = {
  assign: false,
  changeTechnician: false,
  unassign: false,
  complete: false,
  invoice: false,
};

describe("availableWorkOrderActions", () => {
  it.each([
    ["New", { ...none, assign: true }],
    ["Assigned", { ...none, changeTechnician: true, unassign: true }],
    ["InProgress", { ...none, complete: true }],
    ["Completed", { ...none, invoice: true }],
    ["Invoiced", none],
  ] as const)("offers the dispatcher the actions allowed in the %s status", (status, actions) => {
    expect(availableWorkOrderActions(status, "Dispatcher")).toEqual(actions);
    expect(availableWorkOrderActions(status, "Admin")).toEqual(actions);
  });

  it.each(["New", "Assigned", "InProgress", "Completed", "Invoiced"] as const)(
    "offers the technician no actions in the read-only panel for the %s status",
    (status) => {
      expect(availableWorkOrderActions(status, "Technician")).toEqual(none);
    },
  );
});

describe("canEditWorkOrder", () => {
  it.each([
    ["New", true],
    ["Assigned", true],
    ["InProgress", true],
    ["Completed", false],
    ["Invoiced", false],
  ] as const)("allows editing a work order in the %s status: %s", (status, editable) => {
    expect(canEditWorkOrder(status)).toBe(editable);
  });
});
