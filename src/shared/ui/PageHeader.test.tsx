import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/shared/ui/PageHeader";

describe("PageHeader", () => {
  it("renders the page heading and titles the browser tab with it", () => {
    render(<PageHeader title="Klienci" />);

    expect(screen.getByRole("heading", { level: 1, name: "Klienci" })).toBeInTheDocument();
    expect(document.title).toBe("Klienci - FixFlow");
  });

  it("adds the edited subject to the browser tab title", () => {
    render(<PageHeader title="Edycja klienta" subject="Hotel Pod Lipami" description="Opis" />);

    expect(document.title).toBe("Edycja klienta: Hotel Pod Lipami - FixFlow");
    expect(screen.getByText("Opis")).toBeInTheDocument();
  });

  it("shows the page actions and the back link", () => {
    render(
      <PageHeader
        title="Zlecenia"
        back={<a href="/work-orders">Wróć</a>}
        actions={<button type="button">Nowe zlecenie</button>}
      />,
    );

    expect(screen.getByRole("link", { name: "Wróć" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nowe zlecenie" })).toBeInTheDocument();
  });
});
