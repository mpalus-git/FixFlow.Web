import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { signInAs } from "@/test/signedInUser";

describe("AppLayout", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("marks the dashboard link as the current page", async () => {
    renderApp("/");

    const navigation = await screen.findByRole("navigation", { name: "Nawigacja główna" });

    expect(within(navigation).getByRole("link", { name: "Pulpit" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers a link that skips to the main content", async () => {
    renderApp("/");

    expect(await screen.findByRole("link", { name: "Przejdź do treści" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("closes the mobile menu after choosing a link", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: "Otwórz menu" }));
    const menu = screen.getByRole("dialog");
    await user.click(within(menu).getByRole("link", { name: "Pulpit" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
