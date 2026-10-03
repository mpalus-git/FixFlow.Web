import { screen } from "@testing-library/react";
import { endSession } from "@/shared/session/sessionStore";
import { renderApp } from "@/test/renderApp";
import { signInAs } from "@/test/signedInUser";

vi.mock("@/app/layout/AppLayout", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("application layout loading", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the route error screen when the layout module fails to load", async () => {
    signInAs("Dispatcher");

    renderApp("/parts");

    expect(await screen.findByRole("heading", { name: "Coś poszło nie tak" })).toBeInTheDocument();
  });

  it("still shows the sign-in page without the layout module", async () => {
    renderApp("/login");

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
  });
});
