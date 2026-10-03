import i18next from "i18next";
import en from "@/shared/i18n/en.json";
import { changeLanguage } from "@/shared/i18n/i18n";
import pl from "@/shared/i18n/pl.json";

function collectKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

const pluralSuffix = /_(zero|one|two|few|many|other)$/;

function withoutPluralForms(keys: string[]): string[] {
  return [...new Set(keys.map((key) => key.replace(pluralSuffix, "")))].sort();
}

describe("i18n", () => {
  afterEach(async () => {
    await changeLanguage("pl");
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("keeps Polish and English translations with the same keys", () => {
    expect(withoutPluralForms(collectKeys(en))).toEqual(withoutPluralForms(collectKeys(pl)));
  });

  it.each([
    ["pl", pl],
    ["en", en],
  ])("provides every plural form required by the %s language", (language, resource) => {
    const keys = collectKeys(resource);
    const pluralKeys = withoutPluralForms(keys.filter((key) => pluralSuffix.test(key)));
    const categories = new Intl.PluralRules(language).resolvedOptions().pluralCategories;

    const missingKeys = pluralKeys.flatMap((key) =>
      categories.map((category) => `${key}_${category}`).filter((form) => !keys.includes(form)),
    );

    expect(missingKeys).toEqual([]);
  });

  it("uses Polish by default", () => {
    expect(i18next.t("language.label")).toBe("Język");
  });

  it("stores the chosen language and sets the document language", async () => {
    await changeLanguage("en");

    expect(i18next.t("language.label")).toBe("Language");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("fixflow.language")).toBe("en");
  });

  it("restores the language saved during a previous visit", async () => {
    localStorage.setItem("fixflow.language", "en");
    vi.resetModules();

    await import("@/shared/i18n/i18n");

    expect(i18next.language).toBe("en");
  });

  it("takes the language from the address and keeps the rest of it", async () => {
    window.history.replaceState(null, "", "/work-orders?lang=en&status=New#top");
    vi.resetModules();

    await import("@/shared/i18n/i18n");

    expect(i18next.language).toBe("en");
    expect(localStorage.getItem("fixflow.language")).toBe("en");
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
      "/work-orders?status=New#top",
    );
  });

  it("prefers the language from the address over the saved choice", async () => {
    localStorage.setItem("fixflow.language", "en");
    window.history.replaceState(null, "", "/?lang=PL");
    vi.resetModules();

    await import("@/shared/i18n/i18n");

    expect(i18next.language).toBe("pl");
    expect(localStorage.getItem("fixflow.language")).toBe("pl");
  });

  it("ignores an unsupported language in the address", async () => {
    localStorage.setItem("fixflow.language", "en");
    window.history.replaceState(null, "", "/login?lang=de");
    vi.resetModules();

    await import("@/shared/i18n/i18n");

    expect(i18next.language).toBe("en");
    expect(localStorage.getItem("fixflow.language")).toBe("en");
    expect(window.location.search).toBe("");
  });
});
