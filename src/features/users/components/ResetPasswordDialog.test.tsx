import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { mockUserList, userAccounts, usersUrl } from "@/test/userFixtures";

type ResetPasswordRequest = components["schemas"]["ResetPasswordRequest"];
type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

const technician = userAccounts[2];

function mockReset(respond: () => Response) {
  const received: { userId: string; body: ResetPasswordRequest }[] = [];
  mockUserList();
  server.use(
    http.post<{ userId: string }, ResetPasswordRequest>(
      `${usersUrl}/:userId/password`,
      async ({ params, request }) => {
        received.push({ userId: params.userId, body: await request.json() });
        return respond();
      },
    ),
  );
  return received;
}

async function resetPasswordOf(email: string, password: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: `Akcje konta ${email}` }));
  await user.click(screen.getByRole("menuitem", { name: "Resetuj hasło" }));
  const dialog = screen.getByRole("dialog");
  await user.type(within(dialog).getByLabelText("Nowe hasło"), password);
  await user.type(within(dialog).getByLabelText("Powtórz nowe hasło"), password);
  await user.click(within(dialog).getByRole("button", { name: "Ustaw hasło" }));
  return dialog;
}

describe("ResetPasswordDialog", () => {
  beforeEach(() => {
    signInAs("Admin");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("sets the new password of the chosen account", async () => {
    const received = mockReset(() => new HttpResponse(null, { status: 204 }));
    renderApp("/users");

    await resetPasswordOf("jan.technik@fixflow.test", "Nowe#Haslo1");

    expect(
      await screen.findByText("Ustawiono nowe hasło dla jan.technik@fixflow.test."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(received).toEqual([{ userId: technician?.id, body: { newPassword: "Nowe#Haslo1" } }]);
  });

  it("shows a password rule reported by the API on the new password field", async () => {
    mockReset(() => {
      const problem: ValidationProblem = {
        status: 400,
        title: "One or more validation errors occurred.",
        errors: { newPassword: ["Passwords must have at least one unique character."] },
      };
      return HttpResponse.json(problem, { status: 400 });
    });
    renderApp("/users");

    const dialog = await resetPasswordOf("jan.technik@fixflow.test", "Nowe#Haslo1");

    expect(await within(dialog).findByLabelText("Nowe hasło")).toHaveAccessibleDescription(
      /Passwords must have at least one unique character\./,
    );
  });

  it("does not offer a password reset for a demo account", async () => {
    vi.stubEnv("VITE_DEMO_TECHNICIAN_EMAIL", "jan.technik@fixflow.test");
    vi.stubEnv("VITE_DEMO_TECHNICIAN_PASSWORD", "demo-password");
    mockReset(() => new HttpResponse(null, { status: 500 }));
    renderApp("/users");

    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: "Akcje konta jan.technik@fixflow.test" }));

    expect(screen.getByRole("menuitem", { name: "Resetuj hasło" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByText(/Konto demo jest chronione/)).toBeInTheDocument();
  });
});
