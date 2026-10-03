import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { DeviceClientName, DeviceNameLink } from "@/features/devices";
import { workOrderQueryOptions } from "@/features/work-orders/api/workOrderQueries";
import { ServiceEntryList } from "@/features/work-orders/components/ServiceEntryList";
import { ServiceProtocolButton } from "@/features/work-orders/components/ServiceProtocolButton";
import { WorkOrderActions } from "@/features/work-orders/components/WorkOrderActions";
import { WorkOrderPriorityBadge } from "@/features/work-orders/components/WorkOrderPriorityBadge";
import { WorkOrderStatusBadge } from "@/features/work-orders/components/WorkOrderStatusBadge";
import { WorkOrderStatusTimeline } from "@/features/work-orders/components/WorkOrderStatusTimeline";
import { useReturnPath } from "@/features/work-orders/hooks/useReturnPath";
import { canEditWorkOrder } from "@/features/work-orders/workOrderRules";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDateTime } from "@/shared/lib/dateTime";
import { useCurrentUser } from "@/shared/session/currentUser";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export function WorkOrderDetailsPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { workOrderId = "" } = useParams();
  const user = useCurrentUser();
  const isTechnician = user?.role === "Technician";
  const returnPath = useReturnPath(isTechnician ? "/my-work-orders" : "/work-orders");
  const workOrderQuery = useQuery(workOrderQueryOptions(workOrderId));
  const workOrder = workOrderQuery.data?.data;

  if (workOrder === undefined) {
    return workOrderQuery.isError ? (
      <ErrorState onRetry={() => void workOrderQuery.refetch()} />
    ) : (
      <ListSkeleton rows={4} />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="-ml-2.5 w-fit" asChild>
          <Link to={returnPath}>
            <ArrowLeftIcon aria-hidden="true" />
            {t("workOrders.details.back")}
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("workOrders.details.title", { number: workOrder.number })}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPriorityBadge priority={workOrder.priority} />
              {workOrder.isOverdue ? (
                <Badge variant="destructive">{t("workOrders.overdue")}</Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            {user === undefined ? null : (
              <WorkOrderActions workOrder={workOrder} role={user.role} />
            )}
            <ServiceProtocolButton
              workOrderId={workOrder.id}
              workOrderNumber={workOrder.number}
              status={workOrder.status}
            />
            {!isTechnician && canEditWorkOrder(workOrder.status) ? (
              <Button variant="outline" asChild>
                <Link to={`/work-orders/${workOrder.id}/edit`}>
                  <PencilIcon aria-hidden="true" />
                  {t("workOrders.details.edit")}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <Card>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">{t("workOrders.columns.device")}</dt>
            <dd>
              <DeviceNameLink deviceId={workOrder.deviceId} linked={!isTechnician} />
            </dd>
            <dt className="text-muted-foreground">{t("workOrders.columns.client")}</dt>
            <dd>
              <DeviceClientName deviceId={workOrder.deviceId} linked={!isTechnician} />
            </dd>
            <dt className="text-muted-foreground">{t("workOrders.columns.technician")}</dt>
            <dd>{workOrder.technicianName ?? t("workOrders.unassigned")}</dd>
            <dt className="text-muted-foreground">{t("workOrders.columns.dueDate")}</dt>
            <dd>{formatDateTime(workOrder.dueDate, language)}</dd>
            <dt className="text-muted-foreground">{t("workOrders.columns.description")}</dt>
            <dd className="whitespace-pre-line">{workOrder.description}</dd>
          </dl>
        </CardContent>
      </Card>
      <section aria-labelledby="work-order-timeline-heading" className="flex flex-col gap-4">
        <h2 id="work-order-timeline-heading" className="text-lg font-semibold">
          {t("workOrders.details.timeline")}
        </h2>
        <WorkOrderStatusTimeline workOrder={workOrder} />
      </section>
      <section aria-labelledby="work-order-entries-heading" className="flex flex-col gap-4">
        <h2 id="work-order-entries-heading" className="text-lg font-semibold">
          {t("workOrders.details.serviceEntries")}
        </h2>
        <ServiceEntryList workOrderId={workOrder.id} />
      </section>
    </div>
  );
}
