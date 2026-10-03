import { useTranslation } from "react-i18next";
import { WorkOrderList } from "@/features/work-orders/components/WorkOrderList";
import { PageTitle } from "@/shared/ui/PageTitle";

export function MyWorkOrdersPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={t("myWorkOrders.title")} />
      <h1 className="text-2xl font-semibold tracking-tight">{t("myWorkOrders.title")}</h1>
      <WorkOrderList scope="assignedToMe" />
    </div>
  );
}
