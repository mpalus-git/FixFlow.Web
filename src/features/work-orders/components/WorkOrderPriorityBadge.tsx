import {
  ChevronDownIcon,
  ChevronsUpIcon,
  ChevronUpIcon,
  EqualIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { components } from "@/shared/api/schema";
import { Badge } from "@/shared/ui/badge";

type WorkOrderPriority = components["schemas"]["WorkOrderPriority"];

const priorityStyles: Record<
  WorkOrderPriority,
  { icon: LucideIcon; variant: "secondary" | "outline" | "destructive"; className?: string }
> = {
  Low: { icon: ChevronDownIcon, variant: "outline", className: "text-muted-foreground" },
  Normal: { icon: EqualIcon, variant: "secondary" },
  High: {
    icon: ChevronUpIcon,
    variant: "secondary",
    className: "bg-priority-high text-priority-high-foreground",
  },
  Critical: { icon: ChevronsUpIcon, variant: "destructive" },
};

export type WorkOrderPriorityBadgeProps = {
  priority: WorkOrderPriority;
};

export function WorkOrderPriorityBadge({ priority }: WorkOrderPriorityBadgeProps) {
  const { t } = useTranslation();
  const { icon: Icon, variant, className } = priorityStyles[priority];

  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden="true" data-icon="inline-start" />
      {t(`workOrders.priority.${priority}`)}
    </Badge>
  );
}
