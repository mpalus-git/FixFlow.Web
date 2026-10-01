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
type ProblemDetails = components["schemas"]["ProblemDetails"];

const technician = userAccounts[2];
const inactiveTechnician = userAccounts[3];

function mockStatusChanges(deactivate: (accounts: UserResponse[]) => Response) {
  const accounts = userAccounts.map((account) => ({ ...account }));
  mockUserList(accounts);
  server.use(
    http.post(`${usersUrl}/:userId/deactivate`, () => deactivate(accounts)),
    http.post(`${usersUrl}/:userId/activate`, ({ params }) => {
      const account = accounts.find(({ id }) => id === params.userId);
      if (account !== undefined) {
        account.isActive = true;
      }
      return new HttpResponse(null, { status: 204 });
    }),
  );
}

function rowOf(email: string) {
  const row = screen.getByText(email).closest("tr");
  if (row === null) {
    throw new Error(`Row ${email} not found`);
  }
  return within(row);
}

async function openActions(email: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: `Akcje konta ${email}` }));
  return user;
}

describe("user status actions", () => {
  beforeEach(() => {
    signInAs("Admin");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("deactivates an account after confirmation", async () => {
    mockStatusChanges((accounts) => {
      const account = accounts.find(({ id }) => id === technician?.id);
      if (account !== undefined) {
        account.isActive = false;
      }
      return new HttpResponse(null, { status: 204 });
    });
    renderApp("/users");

    const user = await openActions("jan.technik@fixflow.test");
    await user.click(screen.getByRole("menuitem", { name: "Dezaktywuj" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Dezaktywuj" }),
    );

    expect(
      await screen.findByText("Dezaktywowano konto jan.technik@fixflow.test."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(rowOf("jan.technik@fixflow.test").getByText("Nieaktywne")).toBeInTheDocument();
  });

  it("links to the technician's work orders when open work orders block deactivation", async () => {
    mockStatusChanges(() => {
      const problem: ProblemDetails = {
        status: 409,
        title: "Conflict",
        errorCode: "User.HasOpenWorkOrders",
      };
      return HttpResponse.json(problem, { status: 409 });
    });
    renderApp("/users");

    const user = await openActions("jan.technik@fixflow.test");
    await user.click(screen.getByRole("menuitem", { name: "Dezaktywuj" }));
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Dezaktywuj" }));

    expect(
      await within(dialog).findByRole("link", { name: "Pokaż zlecenia technika" }),
    ).toHaveAttribute("href", `/work-orders?technician=${technician?.id ?? ""}`);
    expect(rowOf("jan.technik@fixflow.test").getByText("Aktywne")).toBeInTheDocument();
  });

  it("activates a deactivated account without asking", async () => {
    mockStatusChanges(() => new HttpResponse(null, { status: 204 }));
    renderApp("/users");

    const user = await openActions(inactiveTechnician?.email ?? "");
    await user.click(screen.getByRole("menuitem", { name: "Aktywuj" }));

    expect(
      await screen.findByText("Aktywowano konto piotr.technik@fixflow.test."),
    ).toBeInTheDocument();
    expect(rowOf("piotr.technik@fixflow.test").getByText("Aktywne")).toBeInTheDocument();
  });

  it("does not offer deactivation of the own account or a demo account", async () => {
    vi.stubEnv("VITE_DEMO_DISPATCHER_EMAIL", "anna.dyspozytor@fixflow.test");
    vi.stubEnv("VITE_DEMO_DISPATCHER_PASSWORD", "demo-password");
    mockStatusChanges(() => new HttpResponse(null, { status: 500 }));
    renderApp("/users");

    const user = await openActions("admin@fixflow.test");
    expect(screen.getByRole("menuitem", { name: "Dezaktywuj" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByText(/To Twoje konto/)).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(rowOf("anna.dyspozytor@fixflow.test").getByText("Konto demo")).toBeInTheDocument();
    await openActions("anna.dyspozytor@fixflow.test");
    expect(screen.getByRole("menuitem", { name: "Dezaktywuj" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
