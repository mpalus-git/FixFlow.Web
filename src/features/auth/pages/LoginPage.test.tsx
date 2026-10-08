import { screen, within } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";

describe("LoginPage", () => {
  it("introduces the system and lists what to check in the demo", async () => {
    renderApp("/login");

    expect(await screen.findByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(screen.getByText("System obsługi zleceń serwisowych w terenie.")).toBeInTheDocument();
    const highlights = within(
      screen.getByRole("region", { name: "Co sprawdzić w demo" }),
    ).getAllByRole("listitem");
    expect(highlights.map((item) => item.textContent)).toEqual([
      "Tablica dispatchPrzypisywanie zleceń przeciąganiem, także z klawiatury",
      "Szczegóły zleceniaOś statusów, historia zmian i protokół PDF",
      "Widok technikaWyłącznie własne zlecenia, bez edycji",
    ]);
  });
});
