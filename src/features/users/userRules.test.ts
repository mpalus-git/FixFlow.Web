import { userAccountProtection } from "@/features/users/userRules";
import type { components } from "@/shared/api/schema";
import { isDemoAccountEmail } from "@/shared/lib/demoAccounts";

type UserResponse = components["schemas"]["UserResponse"];

const demoAccounts = [
  { role: "Dispatcher", email: "Dispatcher@Demo.FixFlow", password: "secret" },
] as const;

function isDemo(email: string) {
  return isDemoAccountEmail(email, demoAccounts);
}

const technician: UserResponse = {
  id: "00000000-0000-4000-8000-0000000000a2",
  email: "jan.technik@fixflow.test",
  role: "Technician",
  isActive: true,
};

describe("userAccountProtection", () => {
  it("leaves other accounts open to deactivation and password reset", () => {
    expect(userAccountProtection(technician, "admin-id", isDemo)).toBeNull();
  });

  it("protects the signed-in administrator's own account", () => {
    expect(userAccountProtection(technician, technician.id, isDemo)).toBe("ownAccount");
  });

  it("protects demo accounts regardless of letter case", () => {
    expect(
      userAccountProtection(
        { ...technician, email: "dispatcher@demo.fixflow" },
        "admin-id",
        isDemo,
      ),
    ).toBe("demoAccount");
  });
});
