import { QueryClient } from "@tanstack/react-query";
import { ApiError, isServerUnreachable } from "@/shared/api/apiError";

const maxRetries = 2;

export const serverWakeRetry = {
  intervalMs: 3_000,
  giveUpAfterMs: 90_000,
};

const maxUnreachableRetries = Math.ceil(serverWakeRetry.giveUpAfterMs / serverWakeRetry.intervalMs);

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isServerUnreachable(error)) {
    return failureCount < maxUnreachableRetries;
  }
  return error instanceof ApiError && error.kind === "server" && failureCount < maxRetries;
}

export function queryRetryDelay(failureCount: number, error: unknown): number {
  if (isServerUnreachable(error)) {
    return serverWakeRetry.intervalMs;
  }
  return Math.min(1_000 * 2 ** failureCount, 30_000);
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryQuery,
        retryDelay: queryRetryDelay,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
