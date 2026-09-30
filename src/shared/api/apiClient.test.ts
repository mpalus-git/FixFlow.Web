import { http, HttpResponse } from "msw";
import { apiBaseUrl, apiClient, resolveApiBaseUrl, unwrap } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";

type UserResponse = components["schemas"]["UserResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const currentUserUrl = `${apiBaseUrl}/api/v1/users/me`;

async function getCurrentUserError(): Promise<unknown> {
  try {
    await apiClient.GET("/api/v1/users/me");
  } catch (error) {
    return error;
  }
  throw new Error("Expected the request to fail");
}

describe("resolveApiBaseUrl", () => {
  it("uses the configured API address without a trailing slash", () => {
    expect(resolveApiBaseUrl("https://api.example.com/", "http://localhost:5173")).toBe(
      "https://api.example.com",
    );
  });

  it("falls back to the page origin used by the development proxy", () => {
    expect(resolveApiBaseUrl("", "http://localhost:5173")).toBe("http://localhost:5173");
  });
});

describe("apiClient", () => {
  it("returns the response body of a successful request", async () => {
    const user: UserResponse = {
      id: "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10",
      email: "dispatcher@fixflow.test",
      role: "Dispatcher",
      isActive: true,
    };
    server.use(http.get(currentUserUrl, () => HttpResponse.json(user)));

    expect(unwrap(await apiClient.GET("/api/v1/users/me"))).toEqual(user);
  });

  it("throws an API error with the error code when the API returns problem details", async () => {
    const problem: ProblemDetails = {
      status: 404,
      detail: "User was not found.",
      errorCode: "User.NotFound",
    };
    server.use(
      http.get(currentUserUrl, () =>
        HttpResponse.json(problem, {
          status: 404,
          headers: { "Content-Type": "application/problem+json" },
        }),
      ),
    );

    const error = await getCurrentUserError();

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "notFound", errorCode: "User.NotFound" });
  });

  it("throws a server error when the sleeping server answers with an HTML page", async () => {
    server.use(
      http.get(currentUserUrl, () =>
        HttpResponse.html("<html>Application loading</html>", { status: 503 }),
      ),
    );

    expect(await getCurrentUserError()).toMatchObject({ kind: "server", status: 503 });
  });

  it("throws a network error when the request cannot reach the server", async () => {
    server.use(http.get(currentUserUrl, () => HttpResponse.error()));

    expect(await getCurrentUserError()).toMatchObject({ kind: "network", status: null });
  });
});
