import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { logout, sessionChannelName, startSessionSync } from "@/shared/session/logout";
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
    expect(useSessionStore.getState().status).toBe("anonymous");
    expect(readRefreshToken()).toBeNull();
    await vi.waitFor(() => {
      expect(otherTab.messages).toEqual(["logout"]);
    });
    otherTab.close();
  });

  it("clears the session even when the server cannot be reached", async () => {
    server.use(http.post(logoutUrl, () => HttpResponse.error()));

    await logout();

    expect(useSessionStore.getState().status).toBe("anonymous");
    expect(readRefreshToken()).toBeNull();
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
    otherTab.close();
    stopSessionSync();
  });
});
