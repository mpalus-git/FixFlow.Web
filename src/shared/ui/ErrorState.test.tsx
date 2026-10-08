import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/shared/api/apiError";
import { ErrorState } from "@/shared/ui/ErrorState";

describe("ErrorState", () => {
  it("shows the default message when no text is given", () => {
    render(<ErrorState onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Nie udało się wczytać danych");
  });

  it.each([
    ["network", "Brak połączenia z serwerem"],
    ["server", "Błąd serwera"],
    ["forbidden", "Nie masz uprawnień do tych danych"],
    ["notFound", "Spróbuj ponownie za chwilę"],
  ] as const)("describes a %s error from the API", (kind, description) => {
    render(<ErrorState error={new ApiError({ kind })} onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(description);
  });

  it("shows the generic description for an error that did not come from the API", () => {
    render(<ErrorState error={new TypeError("Failed")} onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Spróbuj ponownie za chwilę");
  });

  it("prefers an explicit description over the error description", () => {
    render(
      <ErrorState
        description="Własny opis"
        error={new ApiError({ kind: "network" })}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Własny opis");
  });

  it("calls the retry handler when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("keeps the alert and the retry button in the compact variant", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState compact error={new ApiError({ kind: "server" })} onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Błąd serwera");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
