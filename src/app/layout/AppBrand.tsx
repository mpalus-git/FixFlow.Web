import { useTranslation } from "react-i18next";
import { BrandMark } from "@/shared/ui/BrandMark";

export function AppBrand() {
  const { t } = useTranslation();

  return (
    <span className="flex items-center gap-2 text-base font-semibold">
      <BrandMark className="size-5" />
      {t("app.name")}
    </span>
  );
}
