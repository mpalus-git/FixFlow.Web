import { ClipboardListIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/ui/EmptyState";

export function MyWorkOrdersPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("myWorkOrders.title")}</h1>
      <EmptyState icon={ClipboardListIcon} title={t("myWorkOrders.comingSoon")} />
    </div>
  );
}
