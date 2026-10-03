import { startThemeSync, useThemeStore } from "@/shared/theme/theme";
import { mockColorScheme } from "@/test/mockColorScheme";

describe("theme", () => {
  let stopThemeSync: () => void = () => undefined;

  afterEach(() => {
    stopThemeSync();
    useThemeStore.getState().setPreference("system");
    localStorage.clear();
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
  });

  function isDark() {
    return document.documentElement.classList.contains("dark");
  }

  it("follows the dark system preference by default", () => {
    mockColorScheme(true);
    useThemeStore.getState().setPreference("system");

    stopThemeSync = startThemeSync();

    expect(isDark()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("switches to the light theme and stores the choice", () => {
    mockColorScheme(true);
    stopThemeSync = startThemeSync();

    useThemeStore.getState().setPreference("light");

    expect(isDark()).toBe(false);
    expect(localStorage.getItem("fixflow.theme")).toBe("light");
  });

  it("marks the document as themed so the pre-start dark background no longer applies", () => {
    mockColorScheme(true);
    expect(document.documentElement).not.toHaveAttribute("data-theme");

    stopThemeSync = startThemeSync();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    useThemeStore.getState().setPreference("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("reacts to a system change in system mode", () => {
    const colorScheme = mockColorScheme(false);
    useThemeStore.getState().setPreference("system");
    stopThemeSync = startThemeSync();

    colorScheme.setPrefersDark(true);

    expect(isDark()).toBe(true);
  });

  it("ignores a system change when the theme is chosen explicitly", () => {
    const colorScheme = mockColorScheme(false);
    stopThemeSync = startThemeSync();
    useThemeStore.getState().setPreference("dark");

    colorScheme.setPrefersDark(false);

    expect(isDark()).toBe(true);
  });

  it("restores the theme saved during a previous visit", async () => {
    mockColorScheme(false);
    localStorage.setItem("fixflow.theme", "dark");
    vi.resetModules();

    const theme = await import("@/shared/theme/theme");

    expect(theme.useThemeStore.getState().preference).toBe("dark");
  });
});
