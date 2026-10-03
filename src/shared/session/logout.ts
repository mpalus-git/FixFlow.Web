import { apiClient } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession } from "@/shared/session/sessionStore";

export const sessionChannelName = "fixflow.session";

const logoutMessage = "logout";

export const revokeTimeoutMs = 5_000;

function openSessionChannel(): BroadcastChannel | null {
  return "BroadcastChannel" in globalThis ? new BroadcastChannel(sessionChannelName) : null;
}

function ignoreRevokeFailure(error: unknown): void {
  if (!(error instanceof ApiError || error instanceof DOMException)) {
    throw error;
  }
}

async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve();
    }, revokeTimeoutMs);
  });
  const revoke = apiClient
    .POST("/api/v1/auth/logout", { body: { refreshToken }, signal: controller.signal })
    .then(() => undefined, ignoreRevokeFailure);
  try {
    await Promise.race([revoke, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function logout(): Promise<void> {
  const refreshToken = readRefreshToken();
  try {
    if (refreshToken !== null) {
      await revokeRefreshToken(refreshToken);
    }
  } finally {
    endSession("signedOut");
    const channel = openSessionChannel();
    channel?.postMessage(logoutMessage);
    channel?.close();
  }
}

export function startSessionSync(): () => void {
  const channel = openSessionChannel();
  if (channel === null) {
    return () => undefined;
  }
  channel.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (event.data === logoutMessage) {
      endSession("signedOut");
    }
  });
  return () => {
    channel.close();
  };
}
