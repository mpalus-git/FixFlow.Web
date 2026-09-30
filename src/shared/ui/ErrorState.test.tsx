import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "@/shared/ui/ErrorState";

describe("ErrorState", () => {
  it("shows the default message when no text is given", () => {
    render(<ErrorState onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Nie udało się wczytać danych");
  });

  it("calls the retry handler when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
