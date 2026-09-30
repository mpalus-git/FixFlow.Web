import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession, getAccessToken } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

type LoginRequest = components["schemas"]["LoginRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const loginUrl = `${apiBaseUrl}/api/v1/auth/login`;

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("E-mail"), email);
  await user.type(screen.getByLabelText("Hasło"), password);
  await user.click(screen.getByRole("button", { name: "Zaloguj się" }));
}

describe("LoginForm", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows field errors without calling the API when the form is empty", async () => {
    const onLoggedIn = vi.fn();
    renderWithProviders(<LoginForm onLoggedIn={onLoggedIn} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Zaloguj się" }));

    expect(screen.getAllByText("To pole jest wymagane")).toHaveLength(2);
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true");
    expect(onLoggedIn).not.toHaveBeenCalled();
  });

  it("starts the session and reports success for valid credentials", async () => {
    const receivedBodies: LoginRequest[] = [];
    server.use(
      http.post<never, LoginRequest>(loginUrl, async ({ request }) => {
        receivedBodies.push(await request.json());
        return HttpResponse.json(createAuthTokens("login"));
      }),
    );
    const onLoggedIn = vi.fn();
    renderWithProviders(<LoginForm onLoggedIn={onLoggedIn} />);

    await fillAndSubmit(" dispatcher@fixflow.test", "Password-1");

    await vi.waitFor(() => {
      expect(onLoggedIn).toHaveBeenCalledOnce();
    });
    expect(receivedBodies).toEqual([{ email: "dispatcher@fixflow.test", password: "Password-1" }]);
    expect(getAccessToken()).toBe("access-login");
  });

  it("shows a generic message when the API rejects the credentials", async () => {
    const problem: ProblemDetails = { status: 401, title: "Unauthorized" };
    server.use(http.post(loginUrl, () => HttpResponse.json(problem, { status: 401 })));
    renderWithProviders(<LoginForm onLoggedIn={vi.fn()} />);

    await fillAndSubmit("dispatcher@fixflow.test", "wrong");

    expect(await screen.findByRole("alert")).toHaveTextContent("Nieprawidłowy e-mail lub hasło");
  });

  it("shows when to try again after too many attempts", async () => {
    const problem: ProblemDetails = { status: 429, detail: "Too many authentication requests." };
    server.use(
      http.post(loginUrl, () =>
        HttpResponse.json(problem, { status: 429, headers: { "Retry-After": "37" } }),
      ),
    );
    renderWithProviders(<LoginForm onLoggedIn={vi.fn()} />);

    await fillAndSubmit("dispatcher@fixflow.test", "Password-1");

    expect(await screen.findByRole("alert")).toHaveTextContent("Spróbuj ponownie za 37 s");
  });
});
