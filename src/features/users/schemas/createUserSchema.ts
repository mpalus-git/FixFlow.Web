import { z } from "zod";
import type { components } from "@/shared/api/schema";
import { newPasswordSchema, requiredText, validationMessages } from "@/shared/lib/validation";
import { isRole } from "@/shared/session/currentUser";

type CreateUserRequest = components["schemas"]["CreateUserRequest"];

export const createUserFields = ["email", "fullName", "password", "role"] as const;

export const fullNameMaxLength = 100;

export const createUserSchema = z
  .object({
    fullName: requiredText(fullNameMaxLength),
    email: z
      .string()
      .trim()
      .min(1, { error: validationMessages.required })
      .max(256, { error: validationMessages.tooLong })
      .pipe(z.email({ error: validationMessages.email })),
    role: z.string().refine((role) => isRole(role), { error: validationMessages.required }),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, { error: validationMessages.required }),
  })
  .refine((values) => values.confirmPassword === values.password, {
    error: validationMessages.passwordConfirmation,
    path: ["confirmPassword"],
  });

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormValues = z.output<typeof createUserSchema>;

export const emptyCreateUserFormValues: CreateUserFormInput = {
  fullName: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
};

export function toCreateUserRequest(values: CreateUserFormValues): CreateUserRequest {
  return {
    email: values.email,
    fullName: values.fullName,
    role: values.role,
    password: values.password,
  };
}
