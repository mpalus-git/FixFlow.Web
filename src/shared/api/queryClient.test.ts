import { ApiError } from "@/shared/api/apiError";
import {
  createQueryClient,
  queryRetryDelay,
  serverWakeRetry,
  shouldRetryQuery,
} from "@/shared/api/queryClient";

describe("shouldRetryQuery", () => {
  it("retries a server error twice", () => {
    const error = new ApiError({ kind: "server" });

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
  });

  it.each(["network", "serverUnavailable"] as const)(
    "keeps retrying a %s error until the server had time to start",
    (kind) => {
      const error = new ApiError({ kind });
      const maxRetries = serverWakeRetry.giveUpAfterMs / serverWakeRetry.intervalMs;

      expect(shouldRetryQuery(maxRetries - 1, error)).toBe(true);
      expect(shouldRetryQuery(maxRetries, error)).toBe(false);
    },
  );

  it.each(["validation", "unauthorized", "notFound", "conflict", "preconditionFailed"] as const)(
    "does not retry a %s error",
    (kind) => {
      expect(shouldRetryQuery(0, new ApiError({ kind }))).toBe(false);
    },
  );

  it("does not retry an error that did not come from the API", () => {
    expect(shouldRetryQuery(0, new TypeError("Cannot read properties of undefined"))).toBe(false);
  });
});

describe("queryRetryDelay", () => {
  it("waits the same interval as the start screen while the server cannot be reached", () => {
    expect(queryRetryDelay(5, new ApiError({ kind: "serverUnavailable" }))).toBe(
      serverWakeRetry.intervalMs,
    );
  });

  it("backs off exponentially after a server error", () => {
    const error = new ApiError({ kind: "server" });

    expect(queryRetryDelay(0, error)).toBe(1_000);
    expect(queryRetryDelay(1, error)).toBe(2_000);
  });
});

describe("createQueryClient", () => {
  it("does not retry mutations", () => {
    expect(createQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });
});
