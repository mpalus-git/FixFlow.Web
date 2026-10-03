import { z } from "zod";
import { requiredText } from "@/shared/lib/validation";

export const fullNameMaxLength = 100;

export const fullNameSchema = requiredText(fullNameMaxLength);

export const userNameFields = ["fullName"] as const;

export const userNameSchema = z.object({ fullName: fullNameSchema });

export type UserNameFormValues = z.infer<typeof userNameSchema>;
