import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "@/app/routes";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe("routes", () => {
  it("shows the lazily loaded dashboard at the root path", async () => {
    renderAt("/");

    expect(await screen.findByRole("heading", { name: "Pulpit" })).toBeInTheDocument();
  });

  it("shows the not found page with a link home for an unknown path", async () => {
    renderAt("/does-not-exist");

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć do pulpitu" })).toHaveAttribute("href", "/");
  });
});
