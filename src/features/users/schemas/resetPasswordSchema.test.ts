import { resetPasswordSchema } from "@/features/users/schemas/resetPasswordSchema";
import { validationMessages } from "@/shared/lib/validation";

function errorsFor(newPassword: string, confirmNewPassword: string) {
  const result = resetPasswordSchema.safeParse({ newPassword, confirmNewPassword });
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]),
  );
}

describe("resetPasswordSchema", () => {
  it("accepts a password that meets the API rules when both entries match", () => {
    expect(errorsFor("Serwis#2026", "Serwis#2026")).toEqual({});
  });

  it("rejects a short password and a confirmation that does not match", () => {
    expect(errorsFor("S#2a", "S#2b")).toEqual({
      newPassword: validationMessages.passwordTooShort,
      confirmNewPassword: validationMessages.passwordConfirmation,
    });
  });
});
