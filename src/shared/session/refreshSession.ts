import { ApiError } from "@/shared/api/apiError";
import { createApiClient, unwrap } from "@/shared/api/baseClient";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession, startSession } from "@/shared/session/sessionStore";

export const refreshLockName = "fixflow.session.refresh";

const sessionClient = createApiClient();

let pendingRefresh: Promise<boolean> | null = null;

function withRefreshLock(task: () => Promise<boolean>): Promise<boolean> {
  if (!("locks" in navigator)) {
    return task();
  }
  return navigator.locks.request(refreshLockName, task);
}

function isRejectedRefreshToken(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.kind === "unauthorized" || error.kind === "validation")
  );
}

async function refreshWithLatestToken(): Promise<boolean> {
  const refreshToken = readRefreshToken();
  if (refreshToken === null) {
    endSession("expired");
    return false;
  }
  try {
    const tokens = unwrap(
      await sessionClient.POST("/api/v1/auth/refresh", { body: { refreshToken } }),
    );
    startSession(tokens);
    return true;
  } catch (error) {
    if (isRejectedRefreshToken(error)) {
      endSession("expired");
      return false;
    }
    throw error;
  }
}

export function refreshSession(): Promise<boolean> {
  pendingRefresh ??= withRefreshLock(refreshWithLatestToken).finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}
