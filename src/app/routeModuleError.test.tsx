import { screen } from "@testing-library/react";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { signInAs } from "@/test/signedInUser";

vi.mock("@/features/parts/pages/PartsPage", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("route module loading", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the route error screen when a page module fails to load", async () => {
    signInAs("Dispatcher");

    renderApp("/parts");

    expect(await screen.findByRole("heading", { name: "Coś poszło nie tak" })).toBeInTheDocument();
  });
});
