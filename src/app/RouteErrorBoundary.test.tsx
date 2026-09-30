import { render, screen } from "@testing-library/react";
import { createMemoryRouter, data } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";

function renderFailingRoute(loader: () => never) {
  const router = createMemoryRouter([
    { path: "/", loader, Component: () => null, ErrorBoundary: RouteErrorBoundary },
  ]);
  render(<RouterProvider router={router} />);
}

describe("RouteErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("shows an error with a retry button when a route fails", async () => {
    renderFailingRoute(() => {
      throw new Error("Chunk failed to load");
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("Coś poszło nie tak");
    expect(screen.getByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  });

  it("shows the not found page when a route responds with 404", async () => {
    renderFailingRoute(() => {
      throw data(null, { status: 404 });
    });

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
  });
});
