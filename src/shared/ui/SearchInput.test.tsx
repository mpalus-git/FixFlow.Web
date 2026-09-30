import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/shared/ui/SearchInput";

function renderSearchInput(value = "", onSearch = vi.fn()) {
  const view = render(
    <SearchInput
      label="Szukaj klientów"
      placeholder="Nazwa klienta"
      value={value}
      maxLength={100}
      onSearch={onSearch}
    />,
  );
  return { ...view, onSearch };
}

describe("SearchInput", () => {
  it("searches once with the trimmed text after the user stops typing", async () => {
    const { onSearch } = renderSearchInput();

    await userEvent.setup().type(screen.getByLabelText("Szukaj klientów"), " piekarnia ");

    await vi.waitFor(() => {
      expect(onSearch).toHaveBeenCalledOnce();
    });
    expect(onSearch).toHaveBeenCalledWith("piekarnia");
  });

  it("shows a value changed from outside, for example after going back", () => {
    const { rerender, onSearch } = renderSearchInput("piekarnia");

    rerender(
      <SearchInput
        label="Szukaj klientów"
        placeholder="Nazwa klienta"
        value="stolarz"
        maxLength={100}
        onSearch={onSearch}
      />,
    );

    expect(screen.getByLabelText("Szukaj klientów")).toHaveValue("stolarz");
    expect(onSearch).not.toHaveBeenCalled();
  });
});
