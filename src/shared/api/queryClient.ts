import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/apiError";

const maxRetries = 2;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const isTransient =
    error instanceof ApiError && (error.kind === "server" || error.kind === "network");
  return isTransient && failureCount < maxRetries;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryQuery,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
