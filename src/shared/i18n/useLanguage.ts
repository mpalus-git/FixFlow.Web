import { useTranslation } from "react-i18next";
import { defaultLanguage, isLanguage, type Language } from "@/shared/i18n/languages";

export function useLanguage(): Language {
  const { i18n } = useTranslation();
  return isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : defaultLanguage;
}
