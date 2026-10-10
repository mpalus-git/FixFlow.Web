import type { QueryClient } from "@tanstack/react-query";
import { type MiddlewareFunction, replace } from "react-router";
import { ApiError } from "@/shared/api/apiError";
import { buildLoginPath, readReturnTo } from "@/shared/lib/returnTo";
import { currentUserQueryOptions, homePathFor, type Role } from "@/shared/session/currentUser";
import { refreshSession } from "@/shared/session/refreshSession";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { useSessionStore } from "@/shared/session/sessionStore";

async function hasActiveSession(): Promise<boolean> {
  if (useSessionStore.getState().status === "authenticated") {
    return true;
  }
  return readRefreshToken() !== null && refreshSession();
}

function pathOf(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function createRequireSession(queryClient: QueryClient): MiddlewareFunction {
  return async ({ url }) => {
    if (!(await hasActiveSession())) {
      throw replace(buildLoginPath(pathOf(url)));
    }
    try {
      await queryClient.query(currentUserQueryOptions());
    } catch (error) {
      if (error instanceof ApiError && error.kind === "unauthorized") {
        throw replace(buildLoginPath(pathOf(url)));
      }
      throw error;
    }
  };
}

export function createRequireRole(
  queryClient: QueryClient,
  allowedRoles: readonly Role[],
): MiddlewareFunction {
  return async () => {
    const user = await queryClient.query(currentUserQueryOptions());
    if (!allowedRoles.includes(user.role)) {
      throw replace(homePathFor(user.role));
    }
  };
}

export function createRedirectSignedIn(queryClient: QueryClient): MiddlewareFunction {
  return async ({ url }) => {
    const isSignedIn = await hasActiveSession().catch(() => false);
    if (!isSignedIn) {
      return;
    }
    const user = await queryClient.query(currentUserQueryOptions()).catch(() => null);
    if (user !== null) {
      throw replace(readReturnTo(url.searchParams.get("returnTo")) ?? homePathFor(user.role));
    }
  };
}
