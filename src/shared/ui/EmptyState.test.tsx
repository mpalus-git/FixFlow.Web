import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/shared/ui/EmptyState";

describe("EmptyState", () => {
  it("shows the title, description and action", () => {
    render(
      <EmptyState
        title="No clients"
        description="Add the first client"
        action={<button type="button">Add client</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "No clients" })).toBeInTheDocument();
    expect(screen.getByText("Add the first client")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add client" })).toBeInTheDocument();
  });
});
