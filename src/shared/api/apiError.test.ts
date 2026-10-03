import type { components } from "@/shared/api/schema";
import { ApiError, isServerUnreachable, toApiError } from "@/shared/api/apiError";

type ProblemDetails = components["schemas"]["ProblemDetails"];
type ValidationProblemDetails = components["schemas"]["HttpValidationProblemDetails"];

function problemResponse(status: number, headers: Record<string, string> = {}) {
  return new Response(null, { status, headers });
}

describe("toApiError", () => {
  it("maps validation errors to fields keyed like the request", () => {
    const body: ValidationProblemDetails = {
      status: 400,
      title: "One or more validation errors occurred.",
      errors: { "address.postalCode": ["Postal code must match NN-NNN."] },
    };

    const error = toApiError(problemResponse(400), body);

    expect(error.kind).toBe("validation");
    expect(error.fieldErrors).toEqual({ "address.postalCode": ["Postal code must match NN-NNN."] });
  });

  it("keeps the error code and detail of a conflict", () => {
    const body: ProblemDetails = {
      status: 409,
      detail: "A device with this serial number already exists.",
      errorCode: "Device.DuplicateSerialNumber",
    };

    const error = toApiError(problemResponse(409), body);

    expect(error.kind).toBe("conflict");
    expect(error.errorCode).toBe("Device.DuplicateSerialNumber");
    expect(error.detail).toBe("A device with this serial number already exists.");
  });

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "notFound"],
    [412, "preconditionFailed"],
    [428, "preconditionRequired"],
    [500, "server"],
    [415, "unexpected"],
  ])("maps status %i to %s", (status, kind) => {
    expect(toApiError(problemResponse(status), null).kind).toBe(kind);
  });

  it.each([502, 503, 504])(
    "recognises status %i with a page instead of problem details as an unavailable server",
    (status) => {
      const error = toApiError(problemResponse(status), "<html>Application loading</html>");

      expect(error.kind).toBe("serverUnavailable");
    },
  );

  it("keeps a 503 with problem details from the API as a server error", () => {
    const body: ProblemDetails = { status: 503, title: "Service unavailable" };

    expect(toApiError(problemResponse(503), body).kind).toBe("server");
  });

  it("reads the retry delay of a rate limited request", () => {
    const error = toApiError(problemResponse(429, { "Retry-After": "42" }), {
      status: 429,
      detail: "Too many authentication requests. Try again later.",
    });

    expect(error.kind).toBe("rateLimited");
    expect(error.retryAfterSeconds).toBe(42);
  });

  it("tolerates a body that is not problem details", () => {
    const error = toApiError(problemResponse(500), "<html>Internal error</html>");

    expect(error.kind).toBe("server");
    expect(error.detail).toBeNull();
    expect(error.fieldErrors).toEqual({});
  });
});

describe("isServerUnreachable", () => {
  it.each(["network", "serverUnavailable"] as const)("treats a %s error as unreachable", (kind) => {
    expect(isServerUnreachable(new ApiError({ kind }))).toBe(true);
  });

  it("does not treat a server error with problem details as unreachable", () => {
    expect(isServerUnreachable(new ApiError({ kind: "server" }))).toBe(false);
  });

  it("does not treat an error that did not come from the API as unreachable", () => {
    expect(isServerUnreachable(new TypeError("Failed to fetch"))).toBe(false);
  });
});
