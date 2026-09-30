import { intlLocales, type Language } from "@/shared/i18n/languages";

const formatters = new Map<Language, Intl.NumberFormat>();

export function formatMoney(amount: number, language: Language): string {
  let formatter = formatters.get(language);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocales[language], {
      style: "currency",
      currency: "PLN",
    });
    formatters.set(language, formatter);
  }
  return formatter.format(amount);
}
