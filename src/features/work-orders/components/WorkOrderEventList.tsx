import { useQuery } from "@tanstack/react-query";
import { HistoryIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { workOrderEventsQueryOptions } from "@/features/work-orders/api/workOrderQueries";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime } from "@/shared/lib/dateTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

type WorkOrderEventResponse = components["schemas"]["WorkOrderEventResponse"];

function showsTechnician(event: WorkOrderEventResponse): boolean {
  return (
    (event.type === "Assigned" || event.type === "Reassigned") && event.technicianName !== null
  );
}

type WorkOrderEventItemProps = {
  event: WorkOrderEventResponse;
  previousDueDate: string | null;
};

function WorkOrderEventItem({ event, previousDueDate }: WorkOrderEventItemProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const dueDateChanged = previousDueDate !== null && previousDueDate !== event.dueDate;

  return (
    <li className="group/event relative flex flex-col gap-1 pb-5 pl-6 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-0 size-2.5 rounded-full border-2 border-primary bg-background"
      />
      <span
        aria-hidden="true"
        className="absolute top-5 bottom-0 left-[4.5px] w-px bg-border group-last/event:hidden"
      />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="text-sm font-medium">{t(`workOrders.events.type.${event.type}`)}</span>
        <time dateTime={event.occurredAt} className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(event.occurredAt, language)}
        </time>
      </div>
      <dl className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        {showsTechnician(event) ? (
          <div className="flex gap-1.5">
            <dt>{t("workOrders.events.technician")}</dt>
            <dd className="text-foreground">{event.technicianName}</dd>
          </div>
        ) : null}
        {previousDueDate === null || dueDateChanged ? (
          <div className="flex gap-1.5">
            <dt>
              {previousDueDate === null
                ? t("workOrders.events.dueDate")
                : t("workOrders.events.newDueDate")}
            </dt>
            <dd className="text-foreground">{formatDateTime(event.dueDate, language)}</dd>
          </div>
        ) : null}
        <div className="flex gap-1.5">
          <dt>{t("workOrders.events.actor")}</dt>
          <dd>{event.actorName ?? t("workOrders.events.system")}</dd>
        </div>
      </dl>
    </li>
  );
}

export type WorkOrderEventListProps = {
  workOrderId: string;
};

export function WorkOrderEventList({ workOrderId }: WorkOrderEventListProps) {
  const { t } = useTranslation();
  const eventsQuery = useQuery(workOrderEventsQueryOptions(workOrderId));
  const events = eventsQuery.data;

  if (eventsQuery.isError) {
    return (
      <ErrorState compact error={eventsQuery.error} onRetry={() => void eventsQuery.refetch()} />
    );
  }
  if (events === undefined) {
    return <ListSkeleton rows={3} />;
  }
  if (events.length === 0) {
    return (
      <EmptyState
        compact
        icon={HistoryIcon}
        title={t("workOrders.events.empty.title")}
        description={t("workOrders.events.empty.description")}
      />
    );
  }

  return (
    <ol aria-label={t("workOrders.events.label")} className="flex flex-col">
      {events.map((event, index) => (
        <WorkOrderEventItem
          key={event.id}
          event={event}
          previousDueDate={events[index - 1]?.dueDate ?? null}
        />
      ))}
    </ol>
  );
}
