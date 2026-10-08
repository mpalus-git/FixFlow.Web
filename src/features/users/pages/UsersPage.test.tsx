import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { mockUserList, usersUrl } from "@/test/userFixtures";

type ProblemDetails = components["schemas"]["ProblemDetails"];

function rowOf(email: string) {
  const row = screen.getByText(email).closest("tr");
  if (row === null) {
    throw new Error(`Row ${email} not found`);
  }
  return within(row);
}

describe("UsersPage", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("lists accounts by full name with their email, role and status", async () => {
    signInAs("Admin");
    mockUserList();
    renderApp("/users");

    await screen.findByText("jan.technik@fixflow.test");

    expect(rowOf("jan.technik@fixflow.test").getByText("Jan Kowalski")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Imię i nazwisko" })).toBeInTheDocument();
    expect(rowOf("admin@fixflow.test").getByText("Twoje konto")).toBeInTheDocument();
    expect(rowOf("anna.dyspozytor@fixflow.test").getAllByText("Dyspozytor")).not.toHaveLength(0);
    expect(rowOf("jan.technik@fixflow.test").getAllByText("Aktywne")).not.toHaveLength(0);
    expect(rowOf("piotr.technik@fixflow.test").getAllByText("Nieaktywne")).not.toHaveLength(0);
    expect(
      within(screen.getByRole("navigation", { name: "Nawigacja główna" })).getByRole("link", {
        name: "Użytkownicy",
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("filters by role and status and keeps the filters in the address", async () => {
    signInAs("Admin");
    const requests = mockUserList();
    const user = userEvent.setup();
    const router = renderApp("/users");

    await user.selectOptions(await screen.findByLabelText("Rola"), "Technician");
    await vi.waitFor(() => {
      expect(requests.at(-1)?.get("role")).toBe("Technician");
    }, 5000);
    await user.selectOptions(screen.getByLabelText("Status konta"), "Nieaktywne");

    await vi.waitFor(() => {
      expect(requests.at(-1)?.get("isActive")).toBe("false");
    }, 5000);
    expect(requests.at(-1)?.get("role")).toBe("Technician");
    expect(router.state.location.search).toBe("?role=Technician&status=inactive");
    await vi.waitFor(() => {
      expect(screen.queryByText("jan.technik@fixflow.test")).not.toBeInTheDocument();
    }, 5000);
    expect(screen.getByText("piotr.technik@fixflow.test")).toBeInTheDocument();
  });

  it("explains when no account matches the filters", async () => {
    signInAs("Admin");
    mockUserList([]);
    renderApp("/users?role=Dispatcher&status=inactive");

    expect(
      await screen.findByText("Żadne konto nie pasuje do wybranych filtrów."),
    ).toBeInTheDocument();
  });

  it("shows an error with a retry when the list cannot be loaded", async () => {
    signInAs("Admin");
    const problem: ProblemDetails = { status: 500, title: "Server error" };
    server.use(http.get(usersUrl, () => HttpResponse.json(problem, { status: 500 })));
    renderApp("/users");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    mockUserList();
    await userEvent.setup().click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByText("jan.technik@fixflow.test")).toBeInTheDocument();
  });

  it("keeps dispatchers out of user management", async () => {
    signInAs("Dispatcher");
    const router = renderApp("/users");

    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    }, 5000);
    const navigation = await screen.findByRole("navigation", { name: "Nawigacja główna" });
    expect(await within(navigation).findByRole("link", { name: "Zlecenia" })).toBeInTheDocument();
    expect(
      within(navigation).queryByRole("link", {
        name: "Użytkownicy",
      }),
    ).not.toBeInTheDocument();
  });
});
