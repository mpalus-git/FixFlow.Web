import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isThemePreference, themePreferences, useThemeStore } from "@/shared/theme/theme";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const themeIcons = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const preference = useThemeStore((state) => state.preference);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const setPreference = useThemeStore((state) => state.setPreference);
  const TriggerIcon = themeIcons[resolvedTheme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("theme.label")}>
          <TriggerIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("theme.label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => {
            if (isThemePreference(value)) {
              setPreference(value);
            }
          }}
        >
          {themePreferences.map((option) => {
            const Icon = themeIcons[option];
            return (
              <DropdownMenuRadioItem key={option} value={option}>
                <Icon aria-hidden="true" />
                {t(`theme.${option}`)}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
