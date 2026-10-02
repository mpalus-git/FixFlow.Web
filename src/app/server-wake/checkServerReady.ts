import { apiBaseUrl } from "@/shared/api/baseClient";

export type ServerReadyCheck = (signal: AbortSignal) => Promise<boolean>;

export const checkServerReady: ServerReadyCheck = async (signal) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/system/ready`, {
      signal,
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
};
