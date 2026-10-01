import {
  createWorkOrderSchema,
  toCreateWorkOrderRequest,
  toUpdateWorkOrderRequest,
  type WorkOrderFormValues,
} from "@/features/work-orders/schemas/workOrderSchema";
import { createWorkOrderResponse } from "@/test/workOrderFixtures";

const now = () => new Date("2026-10-01T10:00:00Z");

const validValues: WorkOrderFormValues = {
  clientId: "3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f",
  deviceId: "7c1e5b2a-3d4f-4a6b-8c9d-0e1f2a3b4c5d",
  description: "Kocioł nie grzeje wody użytkowej",
  priority: "High",
  dueDate: "2026-10-02T09:00",
};

function errorMessages(
  values: WorkOrderFormValues,
  options: { requiresDevice: boolean; unchangedDueDate: string | null },
) {
  const result = createWorkOrderSchema({ ...options, now }).safeParse(values);
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path.join("."), issue.message]));
}

const creating = { requiresDevice: true, unchangedDueDate: null };

describe("createWorkOrderSchema", () => {
  it("accepts a new work order due in the future", () => {
    expect(errorMessages(validValues, creating)).toEqual({});
  });

  it("requires a device when a work order is created", () => {
    expect(errorMessages({ ...validValues, clientId: "", deviceId: "" }, creating)).toEqual({
      clientId: "validation.required",
      deviceId: "validation.required",
    });
  });

  it("rejects a due date that has already passed in Warsaw", () => {
    expect(errorMessages({ ...validValues, dueDate: "2026-10-01T11:59" }, creating)).toEqual({
      dueDate: "validation.futureDateTime",
    });
  });

  it("rejects a time skipped by the spring clock change", () => {
    expect(errorMessages({ ...validValues, dueDate: "2027-03-28T02:30" }, creating)).toEqual({
      dueDate: "validation.dateTime",
    });
  });

  it("rejects a description longer than 2000 characters", () => {
    expect(errorMessages({ ...validValues, description: "a".repeat(2001) }, creating)).toEqual({
      description: "validation.tooLong",
    });
  });

  it("accepts an unchanged overdue due date when a work order is edited", () => {
    const editing = { requiresDevice: false, unchangedDueDate: "2026-09-20T10:00" };

    expect(
      errorMessages({ ...validValues, clientId: "", dueDate: "2026-09-20T10:00" }, editing),
    ).toEqual({});
    expect(
      errorMessages({ ...validValues, clientId: "", dueDate: "2026-09-21T10:00" }, editing),
    ).toEqual({ dueDate: "validation.futureDateTime" });
  });
});

describe("work order requests", () => {
  it("sends the due date of a new work order in UTC", () => {
    expect(toCreateWorkOrderRequest(validValues)).toEqual({
      deviceId: validValues.deviceId,
      description: validValues.description,
      priority: "High",
      dueDate: "2026-10-02T07:00:00.000Z",
    });
  });

  it("sends back the original due date with seconds when the field was not changed", () => {
    const workOrder = createWorkOrderResponse({ dueDate: "2026-09-20T08:00:42.517Z" });

    expect(
      toUpdateWorkOrderRequest({ ...validValues, dueDate: "2026-09-20T10:00" }, workOrder).dueDate,
    ).toBe("2026-09-20T08:00:42.517Z");
    expect(
      toUpdateWorkOrderRequest({ ...validValues, dueDate: "2026-10-03T10:00" }, workOrder).dueDate,
    ).toBe("2026-10-03T08:00:00.000Z");
  });
});
