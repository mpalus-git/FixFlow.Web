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
});
