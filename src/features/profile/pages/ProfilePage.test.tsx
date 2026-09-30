import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { signInAs } from "@/test/signedInUser";

describe("ProfilePage", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("opens from the user menu and shows the account details", async () => {
    signInAs("Dispatcher");
    const user = userEvent.setup();
    const router = renderApp("/");

    await user.click(await screen.findByRole("button", { name: "Konto użytkownika" }));
    await user.click(screen.getByRole("menuitem", { name: "Profil" }));

    expect(await screen.findByRole("heading", { name: "Profil", level: 1 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/profile");
    const main = screen.getByRole("main");
    expect(within(main).getByText("dispatcher@fixflow.test")).toBeInTheDocument();
    expect(within(main).getByText("Dyspozytor")).toBeInTheDocument();
  });

  it("lets a technician change the password", async () => {
    signInAs("Technician");
    renderApp("/profile");

    expect(await screen.findByRole("heading", { name: "Zmiana hasła" })).toBeInTheDocument();
    expect(screen.getByLabelText("Obecne hasło")).toBeEnabled();
    expect(screen.getByText("technician@fixflow.test")).toBeInTheDocument();
    expect(screen.getByText("Technik")).toBeInTheDocument();
  });
});
