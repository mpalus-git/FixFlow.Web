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
} as const;

export type ValidationMessageKey = (typeof validationMessages)[keyof typeof validationMessages];

const validationMessageKeys: readonly string[] = Object.values(validationMessages);

export function isValidationMessageKey(message: string): message is ValidationMessageKey {
  return validationMessageKeys.includes(message);
}
