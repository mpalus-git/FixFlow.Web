import { useTranslation } from "react-i18next";
import type { components } from "@/shared/api/schema";
import { Badge } from "@/shared/ui/badge";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

const statusClassNames: Record<WorkOrderStatus, string> = {
  New: "bg-secondary text-secondary-foreground",
  Assigned: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  InProgress: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  Completed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  Invoiced: "border-border text-muted-foreground",
};

export type WorkOrderStatusBadgeProps = {
  status: WorkOrderStatus;
};

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const { t } = useTranslation();

  return <Badge className={statusClassNames[status]}>{t(`workOrders.status.${status}`)}</Badge>;
}
