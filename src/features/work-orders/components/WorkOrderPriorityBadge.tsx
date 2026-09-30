import {
  ChevronsUpIcon,
  ChevronUpIcon,
  EqualIcon,
  ChevronDownIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { components } from "@/shared/api/schema";
import { Badge } from "@/shared/ui/badge";

type WorkOrderPriority = components["schemas"]["WorkOrderPriority"];

const priorityStyles: Record<WorkOrderPriority, { icon: LucideIcon; className: string }> = {
  Low: { icon: ChevronDownIcon, className: "border-border text-muted-foreground" },
  Normal: { icon: EqualIcon, className: "bg-secondary text-secondary-foreground" },
  High: {
    icon: ChevronUpIcon,
    className: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  },
  Critical: {
    icon: ChevronsUpIcon,
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
};

export type WorkOrderPriorityBadgeProps = {
  priority: WorkOrderPriority;
};

export function WorkOrderPriorityBadge({ priority }: WorkOrderPriorityBadgeProps) {
  const { t } = useTranslation();
  const { icon: Icon, className } = priorityStyles[priority];

  return (
    <Badge className={className}>
      <Icon aria-hidden="true" data-icon="inline-start" />
      {t(`workOrders.priority.${priority}`)}
    </Badge>
  );
}
