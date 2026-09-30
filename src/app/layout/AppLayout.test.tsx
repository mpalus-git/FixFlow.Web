import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoutes } from "@/app/routes";

function renderApp() {
  const router = createMemoryRouter(createRoutes(), { initialEntries: ["/"] });
  render(<RouterProvider router={router} />);
}

describe("AppLayout", () => {
  it("marks the dashboard link as the current page", async () => {
    renderApp();

    const navigation = await screen.findByRole("navigation", { name: "Nawigacja główna" });

    expect(within(navigation).getByRole("link", { name: "Pulpit" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers a link that skips to the main content", async () => {
    renderApp();

    expect(await screen.findByRole("link", { name: "Przejdź do treści" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("closes the mobile menu after choosing a link", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole("button", { name: "Otwórz menu" }));
    const menu = screen.getByRole("dialog");
    await user.click(within(menu).getByRole("link", { name: "Pulpit" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
