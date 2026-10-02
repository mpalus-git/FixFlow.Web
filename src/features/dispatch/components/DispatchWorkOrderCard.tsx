import { useDraggable } from "@dnd-kit/core";
import { cn } from "cn";
import { GripVerticalIcon, LockIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { canDragWorkOrder, type DispatchWorkOrder } from "@/features/dispatch/dispatchBoard";
import { WorkOrderPriorityBadge, WorkOrderStatusBadge } from "@/features/work-orders";
import type { Language } from "@/shared/i18n/languages";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime, formatTime } from "@/shared/lib/dateTime";

const cardClassName = "rounded-lg border bg-card p-1.5 text-sm text-card-foreground shadow-xs";

export function workOrderLabel(workOrder: DispatchWorkOrder, language: Language): string {
  return `${workOrder.clientName}, ${formatDateTime(workOrder.dueDate, language)}`;
}

type CardBodyProps = {
  workOrder: DispatchWorkOrder;
  showDate: boolean;
  handle: ReactNode;
  linked: boolean;
};

function CardBody({ workOrder, showDate, handle, linked }: CardBodyProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { pathname, search } = useLocation();
  const time = showDate
    ? formatDateTime(workOrder.dueDate, language)
    : formatTime(workOrder.dueDate, language);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {handle}
        <time
          dateTime={workOrder.dueDate}
          className={cn("font-medium tabular-nums", workOrder.isOverdue && "text-destructive")}
        >
          {time}
        </time>
        {workOrder.isOverdue ? (
          <>
            <TriangleAlertIcon aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
            <span className="sr-only">{t("dispatch.card.overdue")}</span>
          </>
        ) : null}
      </div>
      {linked ? (
        <Link
          to={`/work-orders/${workOrder.id}`}
          state={{ returnTo: `${pathname}${search}` }}
          className="line-clamp-2 rounded-sm leading-snug font-medium break-words underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {workOrder.clientName}
        </Link>
      ) : (
        <span className="line-clamp-2 leading-snug font-medium break-words">
          {workOrder.clientName}
        </span>
      )}
      <span className="truncate text-xs text-muted-foreground">{workOrder.deviceModel}</span>
      <div className="flex flex-wrap gap-1">
        <WorkOrderPriorityBadge priority={workOrder.priority} />
        {canDragWorkOrder(workOrder) ? null : <WorkOrderStatusBadge status={workOrder.status} />}
      </div>
    </div>
  );
}

export type DispatchWorkOrderCardProps = {
  workOrder: DispatchWorkOrder;
  showDate: boolean;
};

export function DispatchWorkOrderCard({ workOrder, showDate }: DispatchWorkOrderCardProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const draggable = canDragWorkOrder(workOrder);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: workOrder.id,
    disabled: !draggable,
  });
  const lockedLabel = t("dispatch.card.locked", {
    status: t(`workOrders.status.${workOrder.status}`),
  });

  const handle = draggable ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={t("dispatch.card.move", { workOrder: workOrderLabel(workOrder, language) })}
      className="-ml-0.5 flex h-6 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
    >
      <GripVerticalIcon aria-hidden="true" className="size-4" />
    </button>
  ) : (
    <span
      title={lockedLabel}
      className="flex h-6 w-5 shrink-0 items-center justify-center text-muted-foreground"
    >
      <LockIcon aria-hidden="true" className="size-3.5" />
      <span className="sr-only">{lockedLabel}</span>
    </span>
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        cardClassName,
        workOrder.isOverdue && "border-destructive/50",
        !draggable && "border-dashed",
        isDragging && "opacity-40",
      )}
    >
      <CardBody workOrder={workOrder} showDate={showDate} handle={handle} linked />
    </div>
  );
}

export function DispatchWorkOrderCardOverlay({ workOrder, showDate }: DispatchWorkOrderCardProps) {
  const handle = (
    <span className="flex h-6 w-5 shrink-0 items-center justify-center text-muted-foreground">
      <GripVerticalIcon aria-hidden="true" className="size-4" />
    </span>
  );

  return (
    <div className={cn(cardClassName, "h-full cursor-grabbing shadow-lg ring-2 ring-primary")}>
      <CardBody workOrder={workOrder} showDate={showDate} handle={handle} linked={false} />
    </div>
  );
}
