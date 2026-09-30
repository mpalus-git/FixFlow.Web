import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "@/app/layout/ThemeSwitcher";
import { useThemeStore } from "@/shared/theme/theme";

describe("ThemeSwitcher", () => {
  afterEach(() => {
    useThemeStore.getState().setPreference("system");
    localStorage.clear();
  });

  it("marks the current theme preference", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: "Motyw" }));

    expect(screen.getByRole("menuitemradio", { name: "Systemowy" })).toBeChecked();
  });

  it("switches to the dark theme when chosen from the menu", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: "Motyw" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Ciemny" }));

    expect(useThemeStore.getState().preference).toBe("dark");
  });
});
