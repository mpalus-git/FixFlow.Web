import { useTranslation } from "react-i18next";
import { WorkOrderList } from "@/features/work-orders/components/WorkOrderList";

export function MyWorkOrdersPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("myWorkOrders.title")}</h1>
      <WorkOrderList scope="assignedToMe" />
    </div>
  );
}
