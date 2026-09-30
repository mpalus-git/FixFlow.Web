import {
  type ChangePasswordFormValues,
  changePasswordSchema,
} from "@/features/profile/schemas/changePasswordSchema";
import { validationMessages } from "@/shared/lib/validation";

const validValues: ChangePasswordFormValues = {
  currentPassword: "Old-Password-1",
  newPassword: "New-Password-2",
  confirmNewPassword: "New-Password-2",
};

function firstErrorFor(values: ChangePasswordFormValues, field: keyof ChangePasswordFormValues) {
  const result = changePasswordSchema.safeParse(values);
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("changePasswordSchema", () => {
  it("accepts a new password that meets the API rules", () => {
    expect(changePasswordSchema.safeParse(validValues).success).toBe(true);
  });

  it("accepts a Polish letter as the non-alphanumeric character like the API does", () => {
    const newPassword = "NowehasłoA1";

    expect(
      changePasswordSchema.safeParse({
        ...validValues,
        newPassword,
        confirmNewPassword: newPassword,
      }).success,
    ).toBe(true);
  });

  it("requires all fields", () => {
    const empty = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

    expect(firstErrorFor(empty, "currentPassword")).toBe(validationMessages.required);
    expect(firstErrorFor(empty, "newPassword")).toBe(validationMessages.required);
    expect(firstErrorFor(empty, "confirmNewPassword")).toBe(validationMessages.required);
  });

  it.each([
    ["Ab-1", validationMessages.passwordTooShort],
    ["new-password-2", validationMessages.passwordUppercase],
    ["NEW-PASSWORD-2", validationMessages.passwordLowercase],
    ["New-Password", validationMessages.passwordDigit],
    ["NewPassword2", validationMessages.passwordSymbol],
    [`A-1${"a".repeat(126)}`, validationMessages.tooLong],
  ])("rejects the new password %s", (newPassword, message) => {
    expect(firstErrorFor({ ...validValues, newPassword }, "newPassword")).toBe(message);
  });

  it("rejects a new password equal to the current one", () => {
    const values = {
      currentPassword: "Same-Password-1",
      newPassword: "Same-Password-1",
      confirmNewPassword: "Same-Password-1",
    };

    expect(firstErrorFor(values, "newPassword")).toBe(validationMessages.passwordUnchanged);
  });

  it("rejects a confirmation that differs from the new password", () => {
    const values = { ...validValues, confirmNewPassword: "New-Password-3" };

    expect(firstErrorFor(values, "confirmNewPassword")).toBe(
      validationMessages.passwordConfirmation,
    );
  });
});
