import {
  createPartSchema,
  emptyPartFormValues,
  type PartFormValues,
  restockSchema,
  toCreatePartRequest,
  toPartFormValues,
  toUpdatePartRequest,
} from "@/features/parts/schemas/partSchema";
import { validationMessages } from "@/shared/lib/validation";
import { createPartResponse } from "@/test/partFixtures";

const validValues: PartFormValues = {
  name: "Filtr powietrza",
  catalogNumber: "flt-ac-100",
  unitPrice: "45,5",
  stockQuantity: "40",
};

function firstError(mode: "create" | "edit", values: Partial<PartFormValues>) {
  const result = createPartSchema(mode).safeParse({ ...validValues, ...values });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("createPartSchema", () => {
  it("accepts a price with a comma or a dot and at most two decimal places", () => {
    expect(firstError("create", { unitPrice: "45,50" })).toBeUndefined();
    expect(firstError("create", { unitPrice: "45.5" })).toBeUndefined();
    expect(firstError("create", { unitPrice: "0" })).toBeUndefined();
  });

  it.each(["45,505", "-1", "12 000", "abc", "12345678901"])("rejects the price %s", (unitPrice) => {
    expect(firstError("create", { unitPrice })).toBe(validationMessages.price);
  });

  it.each(["-1", "100001", "2.5", "x"])("rejects the initial stock %s", (stockQuantity) => {
    expect(firstError("create", { stockQuantity })).toBe(validationMessages.stockQuantity);
  });

  it("does not validate the stock when editing, because the API does not change it", () => {
    expect(firstError("edit", { stockQuantity: "" })).toBeUndefined();
  });

  it("limits the name and the catalog number like the API", () => {
    expect(firstError("create", { name: "a".repeat(201) })).toBe(validationMessages.tooLong);
    expect(firstError("create", { catalogNumber: "a".repeat(51) })).toBe(
      validationMessages.tooLong,
    );
  });

  it("starts a new part with an empty stock", () => {
    expect(emptyPartFormValues.stockQuantity).toBe("0");
  });
});

describe("restockSchema", () => {
  it.each([
    ["1", true],
    ["100000", true],
    ["0", false],
    ["100001", false],
    ["", false],
  ])("checks the delivered quantity %s", (quantity, valid) => {
    expect(restockSchema.safeParse({ quantity }).success).toBe(valid);
  });
});

describe("part requests", () => {
  it("converts the price with a comma to a number", () => {
    expect(toCreatePartRequest(validValues)).toEqual({
      name: "Filtr powietrza",
      catalogNumber: "flt-ac-100",
      unitPrice: 45.5,
      stockQuantity: 40,
    });
    expect(toUpdatePartRequest(validValues)).toEqual({
      name: "Filtr powietrza",
      catalogNumber: "flt-ac-100",
      unitPrice: 45.5,
    });
  });

  it("shows the price with the decimal separator of the language", () => {
    const part = createPartResponse({ unitPrice: 148.5 });

    expect(toPartFormValues(part, "pl").unitPrice).toBe("148,50");
    expect(toPartFormValues(part, "en").unitPrice).toBe("148.50");
  });
});
