import type { Path } from "react-hook-form";
import { z } from "zod";
import type { components } from "@/shared/api/schema";
import { isLocalDateTime, toLocalDateTimeInput, toUtcIso } from "@/shared/lib/dateTime";
import { requiredText, validationMessages } from "@/shared/lib/validation";

type WorkOrderPriority = components["schemas"]["WorkOrderPriority"];
type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];
type CreateWorkOrderRequest = components["schemas"]["CreateWorkOrderRequest"];
type UpdateWorkOrderRequest = components["schemas"]["UpdateWorkOrderRequest"];

export const workOrderPriorities = [
  "Low",
  "Normal",
  "High",
  "Critical",
] as const satisfies readonly WorkOrderPriority[];

export type WorkOrderFormValues = {
  clientId: string;
  deviceId: string;
  description: string;
  priority: WorkOrderPriority;
  dueDate: string;
};

export type WorkOrderSchemaOptions = {
  requiresDevice: boolean;
  unchangedDueDate: string | null;
  now?: () => Date;
};

export function createWorkOrderSchema({
  requiresDevice,
  unchangedDueDate,
  now = () => new Date(),
}: WorkOrderSchemaOptions) {
  const selection = requiresDevice
    ? z.string().min(1, { error: validationMessages.required })
    : z.string();

  return z.object({
    clientId: selection,
    deviceId: selection,
    description: requiredText(2000),
    priority: z.enum(workOrderPriorities),
    dueDate: z
      .string()
      .min(1, { error: validationMessages.required, abort: true })
      .refine(isLocalDateTime, { error: validationMessages.dateTime, abort: true })
      .refine((value) => value === unchangedDueDate || toUtcIso(value) > now().toISOString(), {
        error: validationMessages.futureDateTime,
      }),
  });
}

export const workOrderFields = [
  "deviceId",
  "description",
  "priority",
  "dueDate",
] as const satisfies readonly Path<WorkOrderFormValues>[];

export function emptyWorkOrderFormValues(clientId = "", deviceId = ""): WorkOrderFormValues {
  return { clientId, deviceId, description: "", priority: "Normal", dueDate: "" };
}

export function toWorkOrderFormValues(workOrder: WorkOrderResponse): WorkOrderFormValues {
  return {
    clientId: "",
    deviceId: workOrder.deviceId,
    description: workOrder.description,
    priority: workOrder.priority,
    dueDate: toLocalDateTimeInput(workOrder.dueDate),
  };
}

export function toCreateWorkOrderRequest(values: WorkOrderFormValues): CreateWorkOrderRequest {
  return {
    deviceId: values.deviceId,
    description: values.description,
    priority: values.priority,
    dueDate: toUtcIso(values.dueDate),
  };
}

export function toUpdateWorkOrderRequest(
  values: WorkOrderFormValues,
  workOrder: WorkOrderResponse,
): UpdateWorkOrderRequest {
  const isDueDateUnchanged = values.dueDate === toLocalDateTimeInput(workOrder.dueDate);
  return {
    description: values.description,
    priority: values.priority,
    dueDate: isDueDateUnchanged ? workOrder.dueDate : toUtcIso(values.dueDate),
  };
}
