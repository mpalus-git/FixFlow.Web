import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { readRefreshToken } from "@/shared/session/refreshTokenStorage";
import { endSession, getAccessToken, startSession } from "@/shared/session/sessionStore";
import { Toaster } from "@/shared/ui/sonner";
import { createAuthTokens } from "@/test/authTokens";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];
type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

const changePasswordUrl = `${apiBaseUrl}/api/v1/users/me/password`;

function renderForm(isDemoAccount = false) {
  renderWithProviders(
    <>
      <ChangePasswordForm isDemoAccount={isDemoAccount} />
      <Toaster />
    </>,
  );
}

async function fillAndSubmit(currentPassword: string, newPassword: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Obecne hasło"), currentPassword);
  await user.type(screen.getByLabelText("Nowe hasło"), newPassword);
  await user.type(screen.getByLabelText("Powtórz nowe hasło"), newPassword);
  await user.click(screen.getByRole("button", { name: "Zmień hasło" }));
}

function respondWithValidationProblem(errors: Record<string, string[]>) {
  const problem: ValidationProblem = { status: 400, errors };
  server.use(http.post(changePasswordUrl, () => HttpResponse.json(problem, { status: 400 })));
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    startSession(createAuthTokens("before"));
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows validation errors without calling the API when the form is empty", async () => {
    renderForm();

    await userEvent.setup().click(screen.getByRole("button", { name: "Zmień hasło" }));

    expect(screen.getAllByText("To pole jest wymagane")).toHaveLength(3);
    expect(screen.getByLabelText("Obecne hasło")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows a mismatch error when the confirmation differs from the new password", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Obecne hasło"), "Old-Password-1");
    await user.type(screen.getByLabelText("Nowe hasło"), "New-Password-2");
    await user.type(screen.getByLabelText("Powtórz nowe hasło"), "New-Password-3");
    await user.click(screen.getByRole("button", { name: "Zmień hasło" }));

    expect(await screen.findByText("Hasła nie są takie same")).toBeInTheDocument();
  });

  it("sends only the passwords, replaces the tokens and clears the form after success", async () => {
    const receivedBodies: ChangePasswordRequest[] = [];
    server.use(
      http.post<never, ChangePasswordRequest>(changePasswordUrl, async ({ request }) => {
        receivedBodies.push(await request.json());
        return HttpResponse.json(createAuthTokens("after"));
      }),
    );
    renderForm();

    await fillAndSubmit("Old-Password-1", "New-Password-2");

    expect(await screen.findByText(/Hasło zostało zmienione/)).toBeInTheDocument();
    expect(receivedBodies).toEqual([
      { currentPassword: "Old-Password-1", newPassword: "New-Password-2" },
    ]);
    expect(getAccessToken()).toBe("access-after");
    expect(readRefreshToken()).toBe("refresh-after");
    expect(screen.getByLabelText("Obecne hasło")).toHaveValue("");
  });

  it("shows the error on the current password field when the API rejects it", async () => {
    respondWithValidationProblem({ currentPassword: ["The current password is incorrect."] });
    renderForm();

    await fillAndSubmit("Wrong-Password-1", "New-Password-2");

    expect(await screen.findByText("The current password is incorrect.")).toBeInTheDocument();
    expect(screen.getByLabelText("Obecne hasło")).toHaveAttribute("aria-invalid", "true");
    expect(getAccessToken()).toBe("access-before");
  });

  it("shows the error on the new password field when the API rejects the new password", async () => {
    respondWithValidationProblem({
      newPassword: ["Passwords must use at least 1 different characters."],
    });
    renderForm();

    await fillAndSubmit("Old-Password-1", "New-Password-2");

    expect(
      await screen.findByText("Passwords must use at least 1 different characters."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nowe hasło")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows when to try again after too many attempts", async () => {
    const problem: ProblemDetails = { status: 429, detail: "Too many authentication requests." };
    server.use(
      http.post(changePasswordUrl, () =>
        HttpResponse.json(problem, { status: 429, headers: { "Retry-After": "42" } }),
      ),
    );
    renderForm();

    await fillAndSubmit("Old-Password-1", "New-Password-2");

    expect(await screen.findByRole("alert")).toHaveTextContent("Spróbuj ponownie za 42 s");
  });

  it("locks the form with an explanation for a demo account", () => {
    renderForm(true);

    expect(screen.getByRole("note")).toHaveTextContent("Hasła kont demo nie można zmienić");
    expect(screen.getByLabelText("Obecne hasło")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zmień hasło" })).toBeDisabled();
  });
});
