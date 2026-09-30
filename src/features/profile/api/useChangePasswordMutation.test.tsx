import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { useChangePasswordMutation } from "@/features/profile/api/useChangePasswordMutation";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession, getAccessToken, startSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { server } from "@/test/server";

type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];
type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

const changePasswordUrl = `${apiBaseUrl}/api/v1/users/me/password`;

const request: ChangePasswordRequest = {
  currentPassword: "Old-Password-1",
  newPassword: "New-Password-2",
};

function renderChangePasswordMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useChangePasswordMutation(), { wrapper }).result;
}

describe("useChangePasswordMutation", () => {
  beforeEach(() => {
    startSession(createAuthTokens("before"));
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("replaces both tokens with the pair returned after the password change", async () => {
    const receivedBodies: ChangePasswordRequest[] = [];
    const receivedAuthorization: (string | null)[] = [];
    server.use(
      http.post<never, ChangePasswordRequest>(changePasswordUrl, async ({ request }) => {
        receivedBodies.push(await request.json());
        receivedAuthorization.push(request.headers.get("Authorization"));
        return HttpResponse.json(createAuthTokens("after"));
      }),
    );
    const result = renderChangePasswordMutation();

    await result.current.mutateAsync(request);

    expect(receivedBodies).toEqual([request]);
    expect(receivedAuthorization).toEqual(["Bearer access-before"]);
    expect(getAccessToken()).toBe("access-after");
    expect(readRefreshToken()).toBe("refresh-after");
  });

  it("keeps the session when the API rejects the current password", async () => {
    const problem: ValidationProblem = {
      status: 400,
      errors: { currentPassword: ["The current password is incorrect."] },
    };
    server.use(http.post(changePasswordUrl, () => HttpResponse.json(problem, { status: 400 })));
    const result = renderChangePasswordMutation();

    const error: unknown = await result.current
      .mutateAsync(request)
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: "validation",
      fieldErrors: { currentPassword: ["The current password is incorrect."] },
    });
    expect(getAccessToken()).toBe("access-before");
    expect(readRefreshToken()).toBe("refresh-before");
  });
});
