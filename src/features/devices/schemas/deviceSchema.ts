import type { Path } from "react-hook-form";
import { z } from "zod";
import type { components } from "@/shared/api/schema";
import { isCalendarDate, todayCalendarDate } from "@/shared/lib/dateTime";
import { requiredText, validationMessages } from "@/shared/lib/validation";

type DeviceRequest = components["schemas"]["UpdateDeviceRequest"];

export const deviceSchema = z.object({
  serialNumber: requiredText(100),
  manufacturer: requiredText(100),
  model: requiredText(100),
  installationDate: z
    .string()
    .min(1, { error: validationMessages.required, abort: true })
    .refine(isCalendarDate, { error: validationMessages.calendarDate, abort: true })
    .refine((date) => date <= todayCalendarDate(), { error: validationMessages.dateInFuture }),
});

export type DeviceFormValues = z.infer<typeof deviceSchema>;

export const deviceFields = [
  "serialNumber",
  "manufacturer",
  "model",
  "installationDate",
] as const satisfies readonly Path<DeviceFormValues>[];

export const emptyDeviceFormValues: DeviceFormValues = {
  serialNumber: "",
  manufacturer: "",
  model: "",
  installationDate: "",
};

export function toDeviceFormValues(device: DeviceRequest): DeviceFormValues {
  return {
    serialNumber: device.serialNumber,
    manufacturer: device.manufacturer,
    model: device.model,
    installationDate: device.installationDate,
  };
}

export function toDeviceRequest(values: DeviceFormValues): DeviceRequest {
  return { ...values };
}
