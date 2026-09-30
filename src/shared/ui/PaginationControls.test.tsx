import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationControls } from "@/shared/ui/PaginationControls";

describe("PaginationControls", () => {
  it("shows the current page, the page count and the total in Polish plural form", () => {
    render(<PaginationControls page={2} pageSize={20} totalCount={45} onPageChange={vi.fn()} />);

    expect(screen.getByText("Strona 2 z 3")).toBeInTheDocument();
    expect(screen.getByText("45 pozycji")).toBeInTheDocument();
  });

  it("moves to the neighbouring pages", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationControls page={2} pageSize={20} totalCount={45} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Poprzednia strona" }));
    await user.click(screen.getByRole("button", { name: "Następna strona" }));

    expect(onPageChange.mock.calls).toEqual([[1], [3]]);
  });

  it("disables both directions when everything fits on one page", () => {
    render(<PaginationControls page={1} pageSize={20} totalCount={3} onPageChange={vi.fn()} />);

    expect(screen.getByText("3 pozycje")).toBeInTheDocument();
    expect(screen.getByText("Strona 1 z 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Poprzednia strona" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Następna strona" })).toBeDisabled();
  });
});
