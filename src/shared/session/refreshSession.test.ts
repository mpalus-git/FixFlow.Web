import { http, HttpResponse } from "msw";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { refreshLockName, refreshSession } from "@/shared/session/refreshSession";
import { readRefreshToken, refreshTokenStorageKey } from "@/shared/session/refreshTokenStorage";
import { endSession, getAccessToken, startSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { server } from "@/test/server";

type RefreshRequest = components["schemas"]["RefreshRequest"];
type AuthTokensResponse = components["schemas"]["AuthTokensResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const refreshUrl = `${apiBaseUrl}/api/v1/auth/refresh`;

function handleRefresh() {
  const receivedTokens: string[] = [];
  server.use(
    http.post<never, RefreshRequest, AuthTokensResponse>(refreshUrl, async ({ request }) => {
      const { refreshToken } = await request.json();
      receivedTokens.push(refreshToken);
      return HttpResponse.json(createAuthTokens(`rotated-${String(receivedTokens.length)}`));
    }),
  );
  return receivedTokens;
}

function installLocks(onRequest: (name: string) => void) {
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: (name: string, task: () => Promise<boolean>) => {
        onRequest(name);
        return task();
      },
    },
  });
}

describe("refreshSession", () => {
  beforeEach(() => {
    startSession(createAuthTokens("initial"));
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "locks");
    endSession();
    localStorage.clear();
  });

  it("sends a single refresh request for parallel callers", async () => {
    const receivedTokens = handleRefresh();

    const results = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(results).toEqual([true, true, true]);
    expect(receivedTokens).toEqual(["refresh-initial"]);
    expect(getAccessToken()).toBe("access-rotated-1");
    expect(readRefreshToken()).toBe("refresh-rotated-1");
  });

  it("uses the refresh token rotated by another tab while waiting for the lock", async () => {
    const receivedTokens = handleRefresh();
    const lockNames: string[] = [];
    installLocks((name) => {
      lockNames.push(name);
      localStorage.setItem(refreshTokenStorageKey, "refresh-from-other-tab");
    });

    await refreshSession();

    expect(lockNames).toEqual([refreshLockName]);
    expect(receivedTokens).toEqual(["refresh-from-other-tab"]);
  });

  it("ends the session when the API rejects the refresh token", async () => {
    const problem: ProblemDetails = { status: 401, detail: "Refresh token is invalid." };
    server.use(http.post(refreshUrl, () => HttpResponse.json(problem, { status: 401 })));

    expect(await refreshSession()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(readRefreshToken()).toBeNull();
  });

  it("keeps the session when refreshing fails because of the network", async () => {
    server.use(http.post(refreshUrl, () => HttpResponse.error()));

    await expect(refreshSession()).rejects.toBeInstanceOf(ApiError);
    expect(readRefreshToken()).toBe("refresh-initial");
  });

  it("ends the session without a request when no refresh token is stored", async () => {
    const receivedTokens = handleRefresh();
    endSession();

    expect(await refreshSession()).toBe(false);
    expect(receivedTokens).toEqual([]);
  });
});
