import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoutes } from "@/app/routes";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { endSession } from "@/shared/session/sessionStore";
import { createAuthTokens } from "@/test/authTokens";
import { server } from "@/test/server";

function renderAt(path: string) {
  const router = createMemoryRouter(createRoutes(), { initialEntries: [path] });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
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

  it("returns to the requested page after logging in", async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/v1/auth/login`, () =>
        HttpResponse.json(createAuthTokens("login")),
      ),
    );
    const user = userEvent.setup();
    renderAt("/login?returnTo=%2Fmissing-page");

    await user.type(await screen.findByLabelText("E-mail"), "dispatcher@fixflow.test");
    await user.type(screen.getByLabelText("Hasło"), "Password-1");
    await user.click(screen.getByRole("button", { name: "Zaloguj się" }));

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
    endSession();
  });
});
