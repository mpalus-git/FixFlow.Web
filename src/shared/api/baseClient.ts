import createClient, { type Middleware } from "openapi-fetch";
import { ApiError, toApiError } from "@/shared/api/apiError";
import type { paths } from "@/shared/api/schema";

export function resolveApiBaseUrl(configuredUrl: string | undefined, origin: string): string {
  const baseUrl = configuredUrl === undefined || configuredUrl === "" ? origin : configuredUrl;
  return baseUrl.replace(/\/+$/, "");
}

export const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_URL, window.location.origin);

async function readBody(response: Response): Promise<unknown> {
  const text = await response.clone().text();
  if (text === "") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch {
    return text;
  }
}

export const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      throw toApiError(response, await readBody(response));
    }
  },
  onError({ error }) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return error;
    }
    return new ApiError({ kind: "network", cause: error });
  },
};

export function createApiClient() {
  const client = createClient<paths>({
    baseUrl: apiBaseUrl,
    fetch: (request) => globalThis.fetch(request),
  });
  client.use(errorMiddleware);
  return client;
}

export function unwrap<T>(result: { data?: T }): T {
  if (result.data === undefined) {
    throw new ApiError({ kind: "unexpected", detail: "Response body is missing" });
  }
  return result.data;
}
