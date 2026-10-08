import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "@/shared/ui/Combobox";

const allOptions: ComboboxOption[] = [
  { value: "1", label: "Hotel Pod Lipami" },
  { value: "2", label: "Piekarnia Kowalski" },
  { value: "3", label: "Przychodnia Zdrowie Plus" },
];

type ClientPickerProps = {
  onQueryChange?: (query: string) => void;
  isLoading?: boolean;
};

function ClientPicker({ onQueryChange, isLoading = false }: ClientPickerProps) {
  const [selected, setSelected] = useState<ComboboxOption | null>(null);
  const [query, setQuery] = useState("");
  const matching = allOptions.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <form>
      <label htmlFor="client">Klient</label>
      <Combobox
        id="client"
        name="client"
        label="Klienci"
        selected={selected}
        options={isLoading ? undefined : matching}
        placeholder="Wyszukaj klienta"
        loadingText="Wczytywanie…"
        emptyText="Brak pasujących klientów"
        errorText="Nie udało się wczytać"
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery);
          onQueryChange?.(nextQuery);
        }}
        onSelect={setSelected}
      />
      <output>{selected?.value ?? "none"}</output>
    </form>
  );
}

function listbox() {
  return screen.getByRole("listbox", { name: "Klienci" });
}

describe("Combobox", () => {
  it("opens the list with the arrow key and chooses the active option with Enter", async () => {
    const user = userEvent.setup();
    render(<ClientPicker />);
    const input = screen.getByRole("combobox", { name: "Klient" });

    await user.click(input);
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute(
      "aria-activedescendant",
      within(listbox()).getByRole("option", { name: "Piekarnia Kowalski" }).id,
    );
    await user.keyboard("{Enter}");

    expect(input).toHaveValue("Piekarnia Kowalski");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("status")).toHaveTextContent("2");
  });

  it("searches after the user stops typing and shows when nothing matches", async () => {
    const onQueryChange = vi.fn();
    const user = userEvent.setup();
    render(<ClientPicker onQueryChange={onQueryChange} />);
    const input = screen.getByRole("combobox", { name: "Klient" });

    await user.type(input, "zdrow");

    await vi.waitFor(() => {
      expect(onQueryChange).toHaveBeenLastCalledWith("zdrow");
    });
    expect(onQueryChange).not.toHaveBeenCalledWith("zd");
    await vi.waitFor(() => {
      expect(
        within(listbox())
          .getAllByRole("option")
          .map((option) => option.textContent),
      ).toEqual(["Przychodnia Zdrowie Plus"]);
    });
    await user.clear(input);
    await user.type(input, "xyz");

    expect(await screen.findByText("Brak pasujących klientów")).toBeInTheDocument();
  });

  it("chooses an option with the mouse and keeps the selection after Escape", async () => {
    const user = userEvent.setup();
    render(<ClientPicker />);
    const input = screen.getByRole("combobox", { name: "Klient" });

    await user.click(input);
    await user.click(within(listbox()).getByRole("option", { name: "Hotel Pod Lipami" }));
    expect(input).toHaveValue("Hotel Pod Lipami");
    expect(input).toHaveFocus();

    await user.click(input);
    await user.type(input, "Pie");
    await user.keyboard("{Escape}");

    expect(input).toHaveValue("Hotel Pod Lipami");
    expect(screen.getByRole("status")).toHaveTextContent("1");
  });

  it("shows that the options are still loading", async () => {
    const user = userEvent.setup();
    render(<ClientPicker isLoading />);

    await user.click(screen.getByRole("combobox", { name: "Klient" }));

    expect(screen.getByText("Wczytywanie…")).toBeInTheDocument();
  });
});
