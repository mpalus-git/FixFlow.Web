import { useTranslation } from "react-i18next";
import type { components } from "@/shared/api/schema";
import { Badge } from "@/shared/ui/badge";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

const statusStyles: Record<
  WorkOrderStatus,
  { variant: "secondary" | "outline"; className?: string }
> = {
  New: { variant: "secondary" },
  Assigned: {
    variant: "secondary",
    className: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
  InProgress: {
    variant: "secondary",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  Completed: {
    variant: "secondary",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  Invoiced: { variant: "outline", className: "text-muted-foreground" },
};

export type WorkOrderStatusBadgeProps = {
  status: WorkOrderStatus;
};

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const { t } = useTranslation();
  const { variant, className } = statusStyles[status];

  return (
    <Badge variant={variant} className={className}>
      {t(`workOrders.status.${status}`)}
    </Badge>
  );
}
