import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import {
  logout,
  revokeTimeoutMs,
  sessionChannelName,
  startSessionSync,
} from "@/shared/session/logout";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession, startSession, useSessionStore } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { server } from "@/test/server";

type LogoutRequest = components["schemas"]["LogoutRequest"];

const logoutUrl = `${apiBaseUrl}/api/v1/auth/logout`;

function listenOnSessionChannel() {
  const messages: unknown[] = [];
  const channel = new BroadcastChannel(sessionChannelName);
  channel.addEventListener("message", (event: MessageEvent<unknown>) => {
    messages.push(event.data);
  });
  return {
    messages,
    close: () => {
      channel.close();
    },
  };
}

describe("logout", () => {
  beforeEach(() => {
    startSession(createAuthTokens("current"));
  });

  afterEach(() => {
    vi.useRealTimers();
    endSession();
    localStorage.clear();
  });

  it("revokes the refresh token, clears the session and notifies other tabs", async () => {
    const revokedTokens: string[] = [];
    server.use(
      http.post<never, LogoutRequest>(logoutUrl, async ({ request }) => {
        revokedTokens.push((await request.json()).refreshToken);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const otherTab = listenOnSessionChannel();

    await logout();

    expect(revokedTokens).toEqual(["refresh-current"]);
    expect(useSessionStore.getState()).toMatchObject({
      status: "anonymous",
      endReason: "signedOut",
    });
    expect(readRefreshToken()).toBeNull();
    await vi.waitFor(() => {
      expect(otherTab.messages).toEqual(["logout"]);
    });
    otherTab.close();
  });

  it("revokes without an access token so an expired session is not refreshed first", async () => {
    const authorizationHeaders: (string | null)[] = [];
    let refreshCount = 0;
    server.use(
      http.post(logoutUrl, ({ request }) => {
        authorizationHeaders.push(request.headers.get("Authorization"));
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${apiBaseUrl}/api/v1/auth/refresh`, () => {
        refreshCount += 1;
        return HttpResponse.json(createAuthTokens("next"));
      }),
    );

    await logout();

    expect(authorizationHeaders).toEqual([null]);
    expect(refreshCount).toBe(0);
  });

  it("clears the session even when the server cannot be reached", async () => {
    server.use(http.post(logoutUrl, () => HttpResponse.error()));

    await logout();

    expect(useSessionStore.getState().status).toBe("anonymous");
    expect(readRefreshToken()).toBeNull();
  });

  it("ends the session locally when the server does not answer in time", async () => {
    let wasAborted = false;
    server.use(
      http.post(
        logoutUrl,
        ({ request }) =>
          new Promise<Response>((_, reject) => {
            request.signal.addEventListener("abort", () => {
              wasAborted = true;
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      ),
    );
    const otherTab = listenOnSessionChannel();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    const loggingOut = logout();
    await vi.advanceTimersByTimeAsync(revokeTimeoutMs - 1);

    expect(useSessionStore.getState().status).toBe("authenticated");

    await vi.advanceTimersByTimeAsync(1);
    await loggingOut;

    expect(useSessionStore.getState().status).toBe("anonymous");
    expect(readRefreshToken()).toBeNull();
    expect(wasAborted).toBe(true);
    await vi.waitFor(() => {
      expect(otherTab.messages).toEqual(["logout"]);
    });
    otherTab.close();
  });
});

describe("startSessionSync", () => {
  it("ends the session when another tab logs out", async () => {
    startSession(createAuthTokens("current"));
    const stopSessionSync = startSessionSync();
    const otherTab = new BroadcastChannel(sessionChannelName);

    otherTab.postMessage("logout");

    await vi.waitFor(() => {
      expect(useSessionStore.getState().status).toBe("anonymous");
    });
    expect(useSessionStore.getState().endReason).toBe("signedOut");
    otherTab.close();
    stopSessionSync();
  });
});
