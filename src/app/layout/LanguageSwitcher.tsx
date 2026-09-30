import { LanguagesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/shared/i18n/i18n";
import { isLanguage, supportedLanguages } from "@/shared/i18n/languages";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label={t("language.label")}>
          <LanguagesIcon aria-hidden="true" />
          <span className="uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => {
            if (isLanguage(value)) {
              void changeLanguage(value);
            }
          }}
        >
          {supportedLanguages.map((option) => (
            <DropdownMenuRadioItem key={option} value={option} lang={option}>
              {t(`language.${option}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
