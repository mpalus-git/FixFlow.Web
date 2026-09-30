import { z } from "zod";
import { validationMessages } from "@/shared/lib/validation";

export const changePasswordFields = ["currentPassword", "newPassword"] as const;

const passwordMaxLength = 128;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: validationMessages.required })
      .max(passwordMaxLength, { error: validationMessages.tooLong }),
    newPassword: z
      .string()
      .min(1, { error: validationMessages.required })
      .min(8, { error: validationMessages.passwordTooShort })
      .max(passwordMaxLength, { error: validationMessages.tooLong })
      .regex(/[A-Z]/, { error: validationMessages.passwordUppercase })
      .regex(/[a-z]/, { error: validationMessages.passwordLowercase })
      .regex(/[0-9]/, { error: validationMessages.passwordDigit })
      .regex(/[^A-Za-z0-9]/, { error: validationMessages.passwordSymbol }),
    confirmNewPassword: z.string().min(1, { error: validationMessages.required }),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    error: validationMessages.passwordUnchanged,
    path: ["newPassword"],
  })
  .refine((values) => values.confirmNewPassword === values.newPassword, {
    error: validationMessages.passwordConfirmation,
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
