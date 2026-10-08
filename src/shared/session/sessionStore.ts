import { create } from "zustand";
import type { components } from "@/shared/api/schema";
import { clearRefreshToken, writeRefreshToken } from "@/shared/session/refreshTokenStorage";

export type AuthTokens = components["schemas"]["AuthTokensResponse"];

type SessionStatus = "anonymous" | "authenticated";

export type SessionEndReason = "expired" | "signedOut";

type SessionState = {
  accessToken: string | null;
  status: SessionStatus;
  endReason: SessionEndReason | null;
};

export const useSessionStore = create<SessionState>()(() => ({
  accessToken: null,
  status: "anonymous",
  endReason: null,
}));

export function startSession(tokens: AuthTokens): void {
  writeRefreshToken(tokens.refreshToken);
  useSessionStore.setState({
    accessToken: tokens.accessToken,
    status: "authenticated",
    endReason: null,
  });
}

export function endSession(reason: SessionEndReason = "expired"): void {
  clearRefreshToken();
  useSessionStore.setState({ accessToken: null, status: "anonymous", endReason: reason });
}

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken;
}
