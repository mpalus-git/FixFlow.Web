import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/app/layout/LanguageSwitcher";
import { changeLanguage } from "@/shared/i18n/i18n";

describe("LanguageSwitcher", () => {
  afterEach(async () => {
    await changeLanguage("pl");
    localStorage.clear();
  });

  it("switches the interface to English when chosen from the menu", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "Język: PL" }));
    await user.click(screen.getByRole("menuitemradio", { name: "English" }));

    expect(await screen.findByRole("button", { name: "Language: EN" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });
});
