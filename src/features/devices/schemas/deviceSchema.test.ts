import {
  type DeviceFormValues,
  deviceSchema,
  toDeviceFormValues,
} from "@/features/devices/schemas/deviceSchema";
import { validationMessages } from "@/shared/lib/validation";
import { createDeviceResponse } from "@/test/deviceFixtures";

const validValues: DeviceFormValues = toDeviceFormValues(createDeviceResponse());

function errorsFor(values: DeviceFormValues) {
  const result = deviceSchema.safeParse(values);
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]),
  );
}

describe("deviceSchema", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a device that meets the API rules", () => {
    expect(errorsFor(validValues)).toEqual({});
  });

  it("requires every field and limits texts to 100 characters", () => {
    expect(
      errorsFor({
        serialNumber: " ",
        manufacturer: "",
        model: "a".repeat(101),
        installationDate: "",
      }),
    ).toEqual({
      serialNumber: validationMessages.required,
      manufacturer: validationMessages.required,
      model: validationMessages.tooLong,
      installationDate: validationMessages.required,
    });
  });

  it("rejects a date that does not exist", () => {
    expect(errorsFor({ ...validValues, installationDate: "2026-02-30" })).toEqual({
      installationDate: validationMessages.calendarDate,
    });
  });

  it("accepts today in Warsaw although it is still the previous day in UTC", () => {
    vi.useFakeTimers({ now: new Date("2026-07-15T22:30:00Z") });

    expect(errorsFor({ ...validValues, installationDate: "2026-07-16" })).toEqual({});
  });

  it("rejects a date after today in Warsaw", () => {
    vi.useFakeTimers({ now: new Date("2026-07-15T22:30:00Z") });

    expect(errorsFor({ ...validValues, installationDate: "2026-07-17" })).toEqual({
      installationDate: validationMessages.dateInFuture,
    });
  });
});
