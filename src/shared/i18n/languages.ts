export const supportedLanguages = ["pl", "en"] as const;

export type Language = (typeof supportedLanguages)[number];

export const defaultLanguage: Language = "pl";

export const intlLocales: Record<Language, string> = {
  pl: "pl-PL",
  en: "en-US",
};

export function isLanguage(value: unknown): value is Language {
  return supportedLanguages.some((language) => language === value);
}
