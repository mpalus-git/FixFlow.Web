import {
  type ClientFormValues,
  clientSchema,
  toClientFormValues,
  toClientRequest,
} from "@/features/clients/schemas/clientSchema";
import { validationMessages } from "@/shared/lib/validation";
import { createClientResponse } from "@/test/clientFixtures";

const validValues: ClientFormValues = toClientFormValues(createClientResponse());

function errorsFor(values: ClientFormValues) {
  const result = clientSchema.safeParse(values);
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]),
  );
}

describe("clientSchema", () => {
  it("accepts a client that meets the API rules", () => {
    expect(clientSchema.safeParse(validValues).success).toBe(true);
  });

  it("treats fields with only spaces as empty", () => {
    const values = { ...validValues, name: "   ", contactPerson: " " };

    expect(errorsFor(values)).toEqual({
      name: validationMessages.required,
      contactPerson: validationMessages.required,
    });
  });

  it.each(["40014", "40-0145", "4-0014", "ab-cde"])("rejects the postal code %s", (postalCode) => {
    const values = { ...validValues, address: { ...validValues.address, postalCode } };

    expect(errorsFor(values)).toEqual({ "address.postalCode": validationMessages.postalCode });
  });

  it.each(["+48 600 100 200", "600-100-200", "32 123 45 67"])(
    "accepts the phone number %s",
    (phone) => {
      expect(errorsFor({ ...validValues, phone })).toEqual({});
    },
  );

  it.each(["12345678", "600 100 200 ext", "++48600100200", `+${"1".repeat(21)}`])(
    "rejects the phone number %s",
    (phone) => {
      expect(errorsFor({ ...validValues, phone })).toEqual({ phone: validationMessages.phone });
    },
  );

  it("enforces the API length limits", () => {
    const values = {
      ...validValues,
      name: "a".repeat(201),
      address: { ...validValues.address, buildingNumber: "1".repeat(21), city: "a".repeat(101) },
    };

    expect(errorsFor(values)).toEqual({
      name: validationMessages.tooLong,
      "address.buildingNumber": validationMessages.tooLong,
      "address.city": validationMessages.tooLong,
    });
  });

  it("accepts an empty email and rejects an invalid one", () => {
    expect(errorsFor({ ...validValues, email: "" })).toEqual({});
    expect(errorsFor({ ...validValues, email: "not-an-email" })).toEqual({
      email: validationMessages.email,
    });
  });
});

describe("toClientRequest", () => {
  it("sends an empty email as null", () => {
    expect(toClientRequest({ ...validValues, email: "" }).email).toBeNull();
  });

  it("keeps the address nested as the API expects", () => {
    expect(toClientRequest(validValues).address).toEqual(createClientResponse().address);
  });
});

describe("toClientFormValues", () => {
  it("shows a missing email as an empty field", () => {
    expect(toClientFormValues(createClientResponse({ email: null })).email).toBe("");
  });
});
