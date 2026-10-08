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
    className: "bg-status-assigned text-status-assigned-foreground",
  },
  InProgress: {
    variant: "secondary",
    className: "bg-status-in-progress text-status-in-progress-foreground",
  },
  Completed: {
    variant: "secondary",
    className: "bg-status-completed text-status-completed-foreground",
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
