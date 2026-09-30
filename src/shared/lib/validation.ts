export const validationMessages = {
  required: "validation.required",
  email: "validation.email",
  tooLong: "validation.tooLong",
} as const;

export type ValidationMessageKey = (typeof validationMessages)[keyof typeof validationMessages];

const validationMessageKeys: readonly string[] = Object.values(validationMessages);

export function isValidationMessageKey(message: string): message is ValidationMessageKey {
  return validationMessageKeys.includes(message);
}
