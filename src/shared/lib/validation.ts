import { z } from "zod";

export const validationMessages = {
  required: "validation.required",
  email: "validation.email",
  tooLong: "validation.tooLong",
  passwordTooShort: "validation.passwordTooShort",
  passwordUppercase: "validation.passwordUppercase",
  passwordLowercase: "validation.passwordLowercase",
  passwordDigit: "validation.passwordDigit",
  passwordSymbol: "validation.passwordSymbol",
  passwordUnchanged: "validation.passwordUnchanged",
  passwordConfirmation: "validation.passwordConfirmation",
  postalCode: "validation.postalCode",
  phone: "validation.phone",
  calendarDate: "validation.calendarDate",
  dateInFuture: "validation.dateInFuture",
  dateTime: "validation.dateTime",
  futureDateTime: "validation.futureDateTime",
  price: "validation.price",
  stockQuantity: "validation.stockQuantity",
  deliveryQuantity: "validation.deliveryQuantity",
} as const;

export type ValidationMessageKey = (typeof validationMessages)[keyof typeof validationMessages];

const validationMessageKeys: readonly string[] = Object.values(validationMessages);

export function isValidationMessageKey(message: string): message is ValidationMessageKey {
  return validationMessageKeys.includes(message);
}

export function requiredText(maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, { error: validationMessages.required })
    .max(maxLength, { error: validationMessages.tooLong });
}

export const passwordMaxLength = 128;

export const newPasswordSchema = z
  .string()
  .min(1, { error: validationMessages.required })
  .min(8, { error: validationMessages.passwordTooShort })
  .max(passwordMaxLength, { error: validationMessages.tooLong })
  .regex(/[A-Z]/, { error: validationMessages.passwordUppercase })
  .regex(/[a-z]/, { error: validationMessages.passwordLowercase })
  .regex(/[0-9]/, { error: validationMessages.passwordDigit })
  .regex(/[^A-Za-z0-9]/, { error: validationMessages.passwordSymbol });
