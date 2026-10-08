import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import type { Role } from "@/shared/session/currentUser";
import { startSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { server } from "@/test/server";

type UserResponse = components["schemas"]["UserResponse"];

const currentUserUrl = `${apiBaseUrl}/api/v1/users/me`;

export function createUser(role: Role | "Auditor"): UserResponse {
  return {
    id: "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10",
    email: `${role.toLowerCase()}@fixflow.test`,
    fullName: `${role} Test`,
    role,
    isActive: true,
  };
}

export function mockCurrentUser(role: Role | "Auditor") {
  server.use(http.get(currentUserUrl, () => HttpResponse.json(createUser(role))));
}

export function signInAs(role: Role) {
  startSession(createAuthTokens("signed-in"));
  mockCurrentUser(role);
}
