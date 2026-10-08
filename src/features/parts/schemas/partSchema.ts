import type { Path } from "react-hook-form";
import { z } from "zod";
import type { components } from "@/shared/api/schema";
import type { Language } from "@/shared/i18n/languages";
import { requiredText, validationMessages } from "@/shared/lib/validation";

type PartResponse = components["schemas"]["PartResponse"];
type CreatePartRequest = components["schemas"]["CreatePartRequest"];
type UpdatePartRequest = components["schemas"]["UpdatePartRequest"];

const maxStockQuantity = 100_000;

const pricePattern = /^\d{1,10}([.,]\d{1,2})?$/;
const wholeNumberPattern = /^\d{1,6}$/;

function wholeNumber(min: number, max: number, message: string) {
  return z
    .string()
    .trim()
    .min(1, { error: validationMessages.required })
    .refine(
      (value) => wholeNumberPattern.test(value) && Number(value) >= min && Number(value) <= max,
      { error: message },
    );
}

const price = z
  .string()
  .trim()
  .min(1, { error: validationMessages.required })
  .regex(pricePattern, { error: validationMessages.price });

export type PartFormMode = "create" | "edit";

export function createPartSchema(mode: PartFormMode) {
  return z.object({
    name: requiredText(200),
    catalogNumber: requiredText(50),
    unitPrice: price,
    stockQuantity:
      mode === "create"
        ? wholeNumber(0, maxStockQuantity, validationMessages.stockQuantity)
        : z.string(),
  });
}

export type PartFormValues = z.infer<ReturnType<typeof createPartSchema>>;

export const partFields = [
  "name",
  "catalogNumber",
  "unitPrice",
  "stockQuantity",
] as const satisfies readonly Path<PartFormValues>[];

export const emptyPartFormValues: PartFormValues = {
  name: "",
  catalogNumber: "",
  unitPrice: "",
  stockQuantity: "0",
};

export function toPartFormValues(part: PartResponse, language: Language): PartFormValues {
  const unitPrice = part.unitPrice.toFixed(2);
  return {
    name: part.name,
    catalogNumber: part.catalogNumber,
    unitPrice: language === "pl" ? unitPrice.replace(".", ",") : unitPrice,
    stockQuantity: String(part.stockQuantity),
  };
}

function parsePrice(value: string): number {
  return Number(value.trim().replace(",", "."));
}

export function toUpdatePartRequest(values: PartFormValues): UpdatePartRequest {
  return {
    name: values.name,
    catalogNumber: values.catalogNumber,
    unitPrice: parsePrice(values.unitPrice),
  };
}

export function toCreatePartRequest(values: PartFormValues): CreatePartRequest {
  return { ...toUpdatePartRequest(values), stockQuantity: Number(values.stockQuantity) };
}

export const restockSchema = z.object({
  quantity: wholeNumber(1, maxStockQuantity, validationMessages.deliveryQuantity),
});

export type RestockFormValues = z.infer<typeof restockSchema>;
