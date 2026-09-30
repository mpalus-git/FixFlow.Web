import { apiBaseUrl } from "@/shared/api/apiClient";

export type ServerReadyCheck = (signal: AbortSignal) => Promise<boolean>;

export const checkServerReady: ServerReadyCheck = async (signal) => {
  try {
    const response = await fetch(`${apiBaseUrl}/health/ready`, { signal, cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
};
