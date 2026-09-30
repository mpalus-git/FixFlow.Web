import { z } from "zod";
import { validationMessages } from "@/shared/lib/validation";

export const loginFields = ["email", "password"] as const;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: validationMessages.required })
    .max(256, { error: validationMessages.tooLong })
    .pipe(z.email({ error: validationMessages.email })),
  password: z
    .string()
    .min(1, { error: validationMessages.required })
    .max(128, { error: validationMessages.tooLong }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
