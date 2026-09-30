import { WrenchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppBrand() {
  const { t } = useTranslation();

  return (
    <span className="flex items-center gap-2 text-base font-semibold">
      <WrenchIcon aria-hidden="true" className="size-5 text-primary" />
      {t("app.name")}
    </span>
  );
}
