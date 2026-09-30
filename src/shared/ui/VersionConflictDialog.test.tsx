import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VersionConflictDialog } from "@/shared/ui/VersionConflictDialog";

describe("VersionConflictDialog", () => {
  it("reloads the current version only when the user asks for it", async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    const onOpenChange = vi.fn();
    render(<VersionConflictDialog open onOpenChange={onOpenChange} onReload={onReload} />);

    const dialog = screen.getByRole("alertdialog", { name: "Dane zmieniły się w międzyczasie" });
    expect(dialog).toBeInTheDocument();
    expect(onReload).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Wczytaj aktualną wersję" }));

    expect(onReload).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("lets the user keep editing without reloading", async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    const onOpenChange = vi.fn();
    render(<VersionConflictDialog open onOpenChange={onOpenChange} onReload={onReload} />);

    await user.click(screen.getByRole("button", { name: "Wróć do edycji" }));

    expect(onReload).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
