import { LayoutDashboardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/ui/EmptyState";

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
      <EmptyState icon={LayoutDashboardIcon} title={t("dashboard.comingSoon")} />
    </div>
  );
}
