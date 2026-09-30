import { http, HttpResponse } from "msw";
import { apiClient } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl, unwrap } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession, startSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { server } from "@/test/server";

type UserResponse = components["schemas"]["UserResponse"];
type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const user: UserResponse = {
  id: "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10",
  email: "dispatcher@fixflow.test",
  role: "Dispatcher",
  isActive: true,
};
const unauthorized: ProblemDetails = { status: 401, title: "Unauthorized" };

function acceptOnlyToken(validToken: string) {
  const receivedAuthorization: (string | null)[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/users/me`, ({ request }) => {
      const authorization = request.headers.get("Authorization");
      receivedAuthorization.push(authorization);
      return authorization === `Bearer ${validToken}`
        ? HttpResponse.json(user)
        : HttpResponse.json(unauthorized, { status: 401 });
    }),
  );
  return receivedAuthorization;
}

function handleRefresh(status: 200 | 401) {
  let refreshCount = 0;
  server.use(
    http.post(`${apiBaseUrl}/api/v1/auth/refresh`, () => {
      refreshCount += 1;
      return status === 200
        ? HttpResponse.json(createAuthTokens("rotated"))
        : HttpResponse.json(unauthorized, { status: 401 });
    }),
  );
  return () => refreshCount;
}

describe("authMiddleware", () => {
  beforeEach(() => {
    startSession(createAuthTokens("expired"));
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("sends the access token of the current session", async () => {
    const receivedAuthorization = acceptOnlyToken("access-expired");

    expect(unwrap(await apiClient.GET("/api/v1/users/me"))).toEqual(user);
    expect(receivedAuthorization).toEqual(["Bearer access-expired"]);
  });

  it("refreshes the session once for parallel requests and repeats them", async () => {
    acceptOnlyToken("access-rotated");
    const refreshCount = handleRefresh(200);

    const results = await Promise.all([
      apiClient.GET("/api/v1/users/me"),
      apiClient.GET("/api/v1/users/me"),
    ]);

    expect(results.map(unwrap)).toEqual([user, user]);
    expect(refreshCount()).toBe(1);
  });

  it("repeats a request with its original body after refreshing", async () => {
    handleRefresh(200);
    const receivedBodies: ChangePasswordRequest[] = [];
    server.use(
      http.post<never, ChangePasswordRequest>(
        `${apiBaseUrl}/api/v1/users/me/password`,
        async ({ request }) => {
          receivedBodies.push(await request.json());
          return request.headers.get("Authorization") === "Bearer access-rotated"
            ? HttpResponse.json(createAuthTokens("after-password-change"))
            : HttpResponse.json(unauthorized, { status: 401 });
        },
      ),
    );
    const body = { currentPassword: "Current-Password-1", newPassword: "New-Password-1" };

    await apiClient.POST("/api/v1/users/me/password", { body });

    expect(receivedBodies).toEqual([body, body]);
  });

  it("repeats a request at most once", async () => {
    const receivedAuthorization = acceptOnlyToken("never-valid");
    handleRefresh(200);

    await expect(apiClient.GET("/api/v1/users/me")).rejects.toMatchObject({
      kind: "unauthorized",
    });
    expect(receivedAuthorization).toHaveLength(2);
  });

  it("ends the session when refreshing is rejected", async () => {
    acceptOnlyToken("access-rotated");
    handleRefresh(401);

    await expect(apiClient.GET("/api/v1/users/me")).rejects.toBeInstanceOf(ApiError);
    expect(readRefreshToken()).toBeNull();
  });

  it("does not try to refresh after a failed login", async () => {
    const refreshCount = handleRefresh(200);
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/login`, () =>
        HttpResponse.json(unauthorized, { status: 401 }),
      ),
    );

    await expect(
      apiClient.POST("/api/v1/auth/login", {
        body: { email: "dispatcher@fixflow.test", password: "wrong" },
      }),
    ).rejects.toMatchObject({ kind: "unauthorized" });
    expect(refreshCount()).toBe(0);
  });
});
