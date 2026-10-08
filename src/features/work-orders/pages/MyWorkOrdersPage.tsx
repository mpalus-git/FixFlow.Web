import { useTranslation } from "react-i18next";
import { WorkOrderList } from "@/features/work-orders/components/WorkOrderList";
import { PageHeader } from "@/shared/ui/PageHeader";

export function MyWorkOrdersPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("myWorkOrders.title")} />
      <WorkOrderList scope="assignedToMe" />
    </div>
  );
}
