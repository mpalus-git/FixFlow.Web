import type { Middleware } from "openapi-fetch";
import { refreshSession } from "@/shared/session/refreshSession";
import { getAccessToken } from "@/shared/session/sessionStore";

const publicPaths = new Set(["/api/v1/auth/login", "/api/v1/auth/refresh"]);

const requestsToRetry = new Map<string, Request>();

function authorize(request: Request): Request {
  const accessToken = getAccessToken();
  if (accessToken === null) {
    request.headers.delete("Authorization");
  } else {
    request.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return request;
}

export const authMiddleware: Middleware = {
  onRequest({ request, schemaPath, id }) {
    if (publicPaths.has(schemaPath)) {
      return undefined;
    }
    requestsToRetry.set(id, request.clone());
    return authorize(request);
  },
  async onResponse({ response, id }) {
    const requestToRetry = requestsToRetry.get(id);
    requestsToRetry.delete(id);
    if (response.status !== 401 || requestToRetry === undefined) {
      return undefined;
    }
    const isRefreshed = await refreshSession();
    return isRefreshed ? globalThis.fetch(authorize(requestToRetry)) : undefined;
  },
  onError({ id }) {
    requestsToRetry.delete(id);
    return undefined;
  },
};
