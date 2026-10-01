import { z } from "zod";
import { newPasswordSchema, validationMessages } from "@/shared/lib/validation";

export const resetPasswordFields = ["newPassword"] as const;

export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordSchema,
    confirmNewPassword: z.string().min(1, { error: validationMessages.required }),
  })
  .refine((values) => values.confirmNewPassword === values.newPassword, {
    error: validationMessages.passwordConfirmation,
    path: ["confirmNewPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
