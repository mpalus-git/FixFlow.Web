import { create } from "zustand";
import type { components } from "@/shared/api/schema";
import { clearRefreshToken, writeRefreshToken } from "@/shared/session/refreshTokenStorage";

export type AuthTokens = components["schemas"]["AuthTokensResponse"];

export type SessionStatus = "anonymous" | "authenticated";

type SessionState = {
  accessToken: string | null;
  status: SessionStatus;
};

export const useSessionStore = create<SessionState>()(() => ({
  accessToken: null,
  status: "anonymous",
}));

export function startSession(tokens: AuthTokens): void {
  writeRefreshToken(tokens.refreshToken);
  useSessionStore.setState({ accessToken: tokens.accessToken, status: "authenticated" });
}

export function endSession(): void {
  clearRefreshToken();
  useSessionStore.setState({ accessToken: null, status: "anonymous" });
}

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken;
}
