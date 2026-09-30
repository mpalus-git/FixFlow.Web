import { ApiError } from "@/shared/api/apiError";
import { createQueryClient, shouldRetryQuery } from "@/shared/api/queryClient";

describe("shouldRetryQuery", () => {
  it.each(["server", "network"] as const)("retries a %s error twice", (kind) => {
    const error = new ApiError({ kind });

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
  });

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

describe("createQueryClient", () => {
  it("does not retry mutations", () => {
    expect(createQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });
});
