import { render, screen } from "@testing-library/react";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

describe("ListSkeleton", () => {
  it("announces loading to assistive technology", () => {
    render(<ListSkeleton />);

    expect(screen.getByRole("status", { name: "Ładowanie…" })).toBeInTheDocument();
  });
});
