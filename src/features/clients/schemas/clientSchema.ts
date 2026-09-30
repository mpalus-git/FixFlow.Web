import type { Path } from "react-hook-form";
import { z } from "zod";
import type { components } from "@/shared/api/schema";
import { requiredText, validationMessages } from "@/shared/lib/validation";

type ClientRequest = components["schemas"]["CreateClientRequest"];

export const clientSchema = z.object({
  name: requiredText(200),
  address: z.object({
    street: requiredText(200),
    buildingNumber: requiredText(20),
    postalCode: z
      .string()
      .trim()
      .min(1, { error: validationMessages.required })
      .regex(/^\d{2}-\d{3}$/, { error: validationMessages.postalCode }),
    city: requiredText(100),
  }),
  contactPerson: requiredText(200),
  phone: z
    .string()
    .trim()
    .min(1, { error: validationMessages.required })
    .regex(/^\+?[0-9 -]{9,20}$/, { error: validationMessages.phone }),
  email: z
    .string()
    .trim()
    .pipe(
      z.union([
        z.literal(""),
        z
          .string()
          .max(256, { error: validationMessages.tooLong })
          .pipe(z.email({ error: validationMessages.email })),
      ]),
    ),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const clientFields = [
  "name",
  "address.street",
  "address.buildingNumber",
  "address.postalCode",
  "address.city",
  "contactPerson",
  "phone",
  "email",
] as const satisfies readonly Path<ClientFormValues>[];

export const emptyClientFormValues: ClientFormValues = {
  name: "",
  address: { street: "", buildingNumber: "", postalCode: "", city: "" },
  contactPerson: "",
  phone: "",
  email: "",
};

export function toClientFormValues(client: ClientRequest): ClientFormValues {
  return {
    name: client.name,
    address: { ...client.address },
    contactPerson: client.contactPerson,
    phone: client.phone,
    email: client.email ?? "",
  };
}

export function toClientRequest(values: ClientFormValues): ClientRequest {
  return { ...values, email: values.email === "" ? null : values.email };
}
