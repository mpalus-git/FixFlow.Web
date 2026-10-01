import { z } from "zod";
import { newPasswordSchema, passwordMaxLength, validationMessages } from "@/shared/lib/validation";

export const changePasswordFields = ["currentPassword", "newPassword"] as const;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: validationMessages.required })
      .max(passwordMaxLength, { error: validationMessages.tooLong }),
    newPassword: newPasswordSchema,
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
