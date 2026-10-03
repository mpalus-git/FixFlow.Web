import { useQuery } from "@tanstack/react-query";
import { WrenchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { serviceEntriesQueryOptions } from "@/features/work-orders/api/workOrderQueries";
import { ServiceEntryCard } from "@/features/work-orders/components/ServiceEntryCard";
import { summarizeServiceEntries } from "@/features/work-orders/serviceEntrySummary";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatMoney } from "@/shared/lib/money";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export type ServiceEntryListProps = {
  workOrderId: string;
};

export function ServiceEntryList({ workOrderId }: ServiceEntryListProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const entriesQuery = useQuery(serviceEntriesQueryOptions(workOrderId));
  const entries = entriesQuery.data;

  if (entriesQuery.isError) {
    return <ErrorState onRetry={() => void entriesQuery.refetch()} />;
  }
  if (entries === undefined) {
    return <ListSkeleton rows={2} />;
  }
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={WrenchIcon}
        title={t("workOrders.serviceEntries.empty.title")}
        description={t("workOrders.serviceEntries.empty.description")}
      />
    );
  }

  const summary = summarizeServiceEntries(entries);

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">{t("workOrders.serviceEntries.totalWorkTime")}</dt>
          <dd className="font-medium">
            {t("workOrders.serviceEntries.duration", {
              hours: Math.floor(summary.workMinutes / 60),
              minutes: summary.workMinutes % 60,
            })}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">
            {t("workOrders.serviceEntries.totalPartsValue")}
          </dt>
          <dd className="font-medium">{formatMoney(summary.partsValue, language)}</dd>
        </div>
      </dl>
      <ol className="flex flex-col gap-4">
        {entries.map((entry) => (
          <li key={entry.id}>
            <ServiceEntryCard entry={entry} />
          </li>
        ))}
      </ol>
    </div>
  );
}
