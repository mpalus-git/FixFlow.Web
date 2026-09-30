import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/shared/i18n/en.json";
import {
  defaultLanguage,
  isLanguage,
  supportedLanguages,
  type Language,
} from "@/shared/i18n/languages";
import pl from "@/shared/i18n/pl.json";
import { readStorage, writeStorage } from "@/shared/lib/storage";

const languageStorageKey = "fixflow.language";

function readStoredLanguage(): Language {
  const stored = readStorage(languageStorageKey);
  return isLanguage(stored) ? stored : defaultLanguage;
}

i18next.on("languageChanged", (language) => {
  document.documentElement.lang = language;
});

void i18next.use(initReactI18next).init({
  resources: {
    pl: { translation: pl },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: defaultLanguage,
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  initAsync: false,
});

export async function changeLanguage(language: Language): Promise<void> {
  writeStorage(languageStorageKey, language);
  await i18next.changeLanguage(language);
}
