import type { components } from "@/shared/api/schema";
import { isDemoAccountEmail } from "@/shared/lib/demoAccounts";

type UserResponse = components["schemas"]["UserResponse"];

export type UserAccountProtection = "ownAccount" | "demoAccount" | null;

export function userAccountProtection(
  user: UserResponse,
  currentUserId: string,
  isDemoAccount: (email: string) => boolean = isDemoAccountEmail,
): UserAccountProtection {
  if (user.id === currentUserId) {
    return "ownAccount";
  }
  return isDemoAccount(user.email) ? "demoAccount" : null;
}
