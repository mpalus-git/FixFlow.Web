import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { mockUserList, userAccounts, usersUrl } from "@/test/userFixtures";

type UserResponse = components["schemas"]["UserResponse"];
type UpdateUserRequest = components["schemas"]["UpdateUserRequest"];
type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

function mockUpdate(respond: (user: UserResponse, request: UpdateUserRequest) => Response) {
  const accounts = userAccounts.map((account) => ({ ...account }));
  const received: { userId: string; body: UpdateUserRequest }[] = [];
  mockUserList(accounts);
  server.use(
    http.put<{ userId: string }, UpdateUserRequest>(
      `${usersUrl}/:userId`,
      async ({ params, request }) => {
        const body = await request.json();
        received.push({ userId: params.userId, body });
        const account = accounts.find((candidate) => candidate.id === params.userId);
        if (account === undefined) {
          return new HttpResponse(null, { status: 404 });
        }
        return respond(account, body);
      },
    ),
  );
  return { accounts, received };
}

async function changeNameOf(email: string, fullName: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: `Akcje konta ${email}` }));
  await user.click(screen.getByRole("menuitem", { name: "Zmień imię i nazwisko" }));
  const dialog = screen.getByRole("dialog");
  const field = within(dialog).getByLabelText("Imię i nazwisko");
  await user.clear(field);
  if (fullName !== "") {
    await user.type(field, fullName);
  }
  await user.click(within(dialog).getByRole("button", { name: "Zapisz" }));
  return dialog;
}

describe("ChangeUserNameDialog", () => {
  beforeEach(() => {
    signInAs("Admin");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("saves the new full name and shows it in the list", async () => {
    const { accounts, received } = mockUpdate((account, { fullName }) => {
      account.fullName = fullName;
      return HttpResponse.json(account);
    });
    renderApp("/users");

    expect(await screen.findByText("Jan Kowalski")).toBeInTheDocument();
    await changeNameOf("jan.technik@fixflow.test", "Jan Nowicki");

    expect(
      await screen.findByText("Zmieniono imię i nazwisko dla jan.technik@fixflow.test."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByText("Jan Nowicki")).toBeInTheDocument();
    expect(received).toEqual([{ userId: accounts[2]?.id, body: { fullName: "Jan Nowicki" } }]);
  });

  it("requires a full name before sending the request", async () => {
    const { received } = mockUpdate((account) => HttpResponse.json(account));
    renderApp("/users");

    const dialog = await changeNameOf("jan.technik@fixflow.test", "");

    expect(within(dialog).getByLabelText("Imię i nazwisko")).toHaveAccessibleDescription(
      "To pole jest wymagane",
    );
    expect(received).toEqual([]);
  });

  it("shows a validation message from the API on the full name field", async () => {
    mockUpdate(() => {
      const problem: ValidationProblem = {
        status: 400,
        title: "One or more validation errors occurred.",
        errors: { fullName: ["The length of 'Full Name' must be 100 characters or fewer."] },
      };
      return HttpResponse.json(problem, { status: 400 });
    });
    renderApp("/users");

    const dialog = await changeNameOf("jan.technik@fixflow.test", "Jan Nowicki");

    expect(await within(dialog).findByLabelText("Imię i nazwisko")).toHaveAccessibleDescription(
      "The length of 'Full Name' must be 100 characters or fewer.",
    );
  });
});
