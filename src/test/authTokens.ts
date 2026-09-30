import type { AuthTokens } from "@/shared/session/sessionStore";

export function createAuthTokens(suffix: string): AuthTokens {
  return {
    accessToken: `access-${suffix}`,
    accessTokenExpiresAt: "2026-09-30T12:15:00Z",
    refreshToken: `refresh-${suffix}`,
    refreshTokenExpiresAt: "2026-10-07T12:00:00Z",
  };
}
