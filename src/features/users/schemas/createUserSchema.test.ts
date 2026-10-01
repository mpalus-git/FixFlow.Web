import {
  type CreateUserFormInput,
  createUserSchema,
  toCreateUserRequest,
} from "@/features/users/schemas/createUserSchema";
import { validationMessages } from "@/shared/lib/validation";

const validValues: CreateUserFormInput = {
  email: " ewa.technik@fixflow.test ",
  role: "Technician",
  password: "Serwis#2026",
  confirmPassword: "Serwis#2026",
};

function errorsFor(values: CreateUserFormInput) {
  const result = createUserSchema.safeParse(values);
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]),
  );
}

describe("createUserSchema", () => {
  it("accepts a new account and sends the trimmed email without the confirmation", () => {
    const values = createUserSchema.parse(validValues);

    expect(toCreateUserRequest(values)).toEqual({
      email: "ewa.technik@fixflow.test",
      role: "Technician",
      password: "Serwis#2026",
    });
  });

  it("requires one of the API roles", () => {
    expect(errorsFor({ ...validValues, role: "" })).toEqual({ role: validationMessages.required });
    expect(errorsFor({ ...validValues, role: "Manager" })).toEqual({
      role: validationMessages.required,
    });
  });

  it("rejects an invalid email and a password the API would refuse", () => {
    expect(
      errorsFor({ ...validValues, email: "ewa", password: "serwis#2026", confirmPassword: "x" }),
    ).toEqual({
      email: validationMessages.email,
      password: validationMessages.passwordUppercase,
      confirmPassword: validationMessages.passwordConfirmation,
    });
  });
});
