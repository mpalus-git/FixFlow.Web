import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type WorkOrderStatus, workOrderStatuses } from "@/features/work-orders/workOrderRules";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime } from "@/shared/lib/dateTime";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];

function reachedAt(workOrder: WorkOrderResponse, status: WorkOrderStatus): string | null {
  switch (status) {
    case "New":
      return workOrder.createdAt;
    case "Assigned":
      return null;
    case "InProgress":
      return workOrder.startedAt;
    case "Completed":
      return workOrder.completedAt;
    case "Invoiced":
      return workOrder.invoicedAt;
  }
}

export type WorkOrderStatusTimelineProps = {
  workOrder: WorkOrderResponse;
};

export function WorkOrderStatusTimeline({ workOrder }: WorkOrderStatusTimelineProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const currentIndex = workOrderStatuses.indexOf(workOrder.status);

  return (
    <ol
      aria-label={t("workOrders.details.timeline")}
      className="grid gap-3 sm:grid-cols-5 sm:gap-2"
    >
      {workOrderStatuses.map((status, index) => {
        const isCurrent = index === currentIndex;
        const isReached = index <= currentIndex;
        const timestamp = isReached ? reachedAt(workOrder, status) : null;

        return (
          <li
            key={status}
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-start gap-3 sm:flex-col sm:gap-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                isReached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground",
                isCurrent && "ring-3 ring-primary/30",
              )}
            >
              {isReached && !isCurrent ? <CheckIcon className="size-4" /> : index + 1}
            </span>
            <span className="flex flex-col">
              <span className={cn("text-sm", isReached ? "font-medium" : "text-muted-foreground")}>
                {t(`workOrders.status.${status}`)}
              </span>
              {timestamp === null ? null : (
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(timestamp, language)}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
