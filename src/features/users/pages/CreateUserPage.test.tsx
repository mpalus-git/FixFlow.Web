import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { mockUserList, usersUrl } from "@/test/userFixtures";

type CreateUserRequest = components["schemas"]["CreateUserRequest"];
type UserResponse = components["schemas"]["UserResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];
type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

function mockCreate(respond: (request: CreateUserRequest) => Response) {
  const received: CreateUserRequest[] = [];
  server.use(
    http.post<never, CreateUserRequest>(usersUrl, async ({ request }) => {
      const body = await request.json();
      received.push(body);
      return respond(body);
    }),
  );
  return received;
}

async function fillForm() {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Imię i nazwisko"), "Ewa Lis");
  await user.type(screen.getByLabelText("E-mail"), "ewa.technik@fixflow.test");
  await user.selectOptions(screen.getByLabelText("Rola"), "Technician");
  await user.type(screen.getByLabelText("Hasło początkowe"), "Serwis#2026");
  await user.type(screen.getByLabelText("Powtórz hasło"), "Serwis#2026");
  await user.click(screen.getByRole("button", { name: "Załóż konto" }));
}

describe("CreateUserPage", () => {
  beforeEach(() => {
    signInAs("Admin");
    mockUserList();
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("creates the account with the chosen role and goes back to the list", async () => {
    const received = mockCreate((request) => {
      const created: UserResponse = {
        id: "00000000-0000-4000-8000-0000000000b1",
        email: request.email,
        fullName: request.fullName,
        role: request.role,
        isActive: true,
      };
      return HttpResponse.json(created, { status: 201 });
    });
    const router = renderApp("/users/new");

    await fillForm();

    expect(await screen.findByText("Założono konto ewa.technik@fixflow.test.")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Użytkownicy", level: 1 }),
    ).toBeInTheDocument();
    expect(received).toEqual([
      {
        email: "ewa.technik@fixflow.test",
        fullName: "Ewa Lis",
        role: "Technician",
        password: "Serwis#2026",
      },
    ]);
    expect(router.state.location.pathname).toBe("/users");
  });

  it("shows the conflict on the email field when the address is already taken", async () => {
    mockCreate(() => {
      const problem: ProblemDetails = {
        status: 409,
        title: "Conflict",
        detail: "A user with this email address already exists.",
        errorCode: "User.DuplicateEmail",
      };
      return HttpResponse.json(problem, { status: 409 });
    });
    renderApp("/users/new");

    await fillForm();

    expect(await screen.findByLabelText("E-mail")).toHaveAccessibleDescription(
      "Konto z tym adresem e-mail już istnieje.",
    );
  });

  it("shows a password rule reported by the API on the password field", async () => {
    mockCreate(() => {
      const problem: ValidationProblem = {
        status: 400,
        title: "One or more validation errors occurred.",
        errors: { password: ["Passwords must have at least one unique character."] },
      };
      return HttpResponse.json(problem, { status: 400 });
    });
    renderApp("/users/new");

    await fillForm();

    expect(
      await screen.findByText("Passwords must have at least one unique character."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło początkowe")).toHaveAttribute("aria-invalid", "true");
  });
});
