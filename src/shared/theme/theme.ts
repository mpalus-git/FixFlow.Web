import { create } from "zustand";
import { readStorage, writeStorage } from "@/shared/lib/storage";

export const themePreferences = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export type ResolvedTheme = "light" | "dark";

type ThemeState = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const themeStorageKey = "fixflow.theme";
const darkSchemeQuery = "(prefers-color-scheme: dark)";

export function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.some((preference) => preference === value);
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") {
    return preference;
  }
  return matchMedia(darkSchemeQuery).matches ? "dark" : "light";
}

function readStoredPreference(): ThemePreference {
  const stored = readStorage(themeStorageKey);
  return isThemePreference(stored) ? stored : "system";
}

function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>()((set) => {
  const preference = readStoredPreference();
  return {
    preference,
    resolvedTheme: resolveTheme(preference),
    setPreference: (nextPreference) => {
      writeStorage(themeStorageKey, nextPreference);
      set({ preference: nextPreference, resolvedTheme: resolveTheme(nextPreference) });
    },
  };
});

export function startThemeSync(): () => void {
  applyTheme(useThemeStore.getState().resolvedTheme);
  const unsubscribe = useThemeStore.subscribe((state) => {
    applyTheme(state.resolvedTheme);
  });

  const mediaQuery = matchMedia(darkSchemeQuery);
  const handleSystemChange = () => {
    if (useThemeStore.getState().preference === "system") {
      useThemeStore.setState({ resolvedTheme: resolveTheme("system") });
    }
  };
  mediaQuery.addEventListener("change", handleSystemChange);

  return () => {
    unsubscribe();
    mediaQuery.removeEventListener("change", handleSystemChange);
  };
}
