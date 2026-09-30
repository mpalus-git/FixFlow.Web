import { loginSchema } from "@/features/auth/schemas/loginSchema";

function firstErrors(values: unknown) {
  const result = loginSchema.safeParse(values);
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path.join("."), issue.message]));
}

describe("loginSchema", () => {
  it("accepts an email with surrounding spaces and trims it", () => {
    const result = loginSchema.parse({ email: " dispatcher@fixflow.test ", password: "secret" });

    expect(result.email).toBe("dispatcher@fixflow.test");
  });

  it("requires both fields", () => {
    expect(firstErrors({ email: "", password: "" })).toEqual({
      email: "validation.required",
      password: "validation.required",
    });
  });

  it("rejects an invalid email address", () => {
    expect(firstErrors({ email: "dispatcher", password: "secret" })).toEqual({
      email: "validation.email",
    });
  });

  it("limits the lengths like the API", () => {
    expect(firstErrors({ email: `${"a".repeat(250)}@x.test`, password: "p".repeat(129) })).toEqual({
      email: "validation.tooLong",
      password: "validation.tooLong",
    });
  });
});
