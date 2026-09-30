import { apiClient } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession } from "@/shared/session/sessionStore";

export const sessionChannelName = "fixflow.session";

const logoutMessage = "logout";

function openSessionChannel(): BroadcastChannel | null {
  return "BroadcastChannel" in globalThis ? new BroadcastChannel(sessionChannelName) : null;
}

async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await apiClient.POST("/api/v1/auth/logout", { body: { refreshToken } });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
  }
}

export async function logout(): Promise<void> {
  const refreshToken = readRefreshToken();
  if (refreshToken !== null) {
    await revokeRefreshToken(refreshToken);
  }
  endSession();
  const channel = openSessionChannel();
  channel?.postMessage(logoutMessage);
  channel?.close();
}

export function startSessionSync(): () => void {
  const channel = openSessionChannel();
  if (channel === null) {
    return () => undefined;
  }
  channel.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (event.data === logoutMessage) {
      endSession();
    }
  });
  return () => {
    channel.close();
  };
}
