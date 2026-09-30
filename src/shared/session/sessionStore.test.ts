import { readRefreshToken, refreshTokenStorageKey } from "@/shared/session/refreshTokenStorage";
import {
  type AuthTokens,
  endSession,
  getAccessToken,
  startSession,
  useSessionStore,
} from "@/shared/session/sessionStore";

const tokens: AuthTokens = {
  accessToken: "access-1",
  accessTokenExpiresAt: "2026-09-30T12:15:00Z",
  refreshToken: "refresh-1",
  refreshTokenExpiresAt: "2026-10-07T12:00:00Z",
};

describe("sessionStore", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("keeps the access token in memory and the refresh token in local storage", () => {
    startSession(tokens);

    expect(getAccessToken()).toBe("access-1");
    expect(useSessionStore.getState().status).toBe("authenticated");
    expect(localStorage.getItem(refreshTokenStorageKey)).toBe("refresh-1");
    const storedValues = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.getItem(localStorage.key(index) ?? ""),
    );
    expect(storedValues).not.toContain("access-1");
  });

  it("forgets both tokens when the session ends", () => {
    startSession(tokens);

    endSession();

    expect(getAccessToken()).toBeNull();
    expect(useSessionStore.getState().status).toBe("anonymous");
    expect(readRefreshToken()).toBeNull();
  });

  it("keeps the refresh token for this tab when local storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    startSession(tokens);

    expect(readRefreshToken()).toBe("refresh-1");
  });

  it("reads a refresh token rotated by another tab from local storage", () => {
    startSession(tokens);

    localStorage.setItem(refreshTokenStorageKey, "refresh-from-other-tab");

    expect(readRefreshToken()).toBe("refresh-from-other-tab");
  });
});
