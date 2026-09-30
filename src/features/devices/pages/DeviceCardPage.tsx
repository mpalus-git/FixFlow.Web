import { useQuery } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { ClientNameLink } from "@/features/clients";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import { WorkOrderHistory } from "@/features/work-orders";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatCalendarDate, formatDate } from "@/shared/lib/dateTime";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export function DeviceCardPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { deviceId = "" } = useParams();
  const deviceQuery = useQuery(deviceQueryOptions(deviceId));

  if (deviceQuery.data === undefined) {
    return deviceQuery.isError ? (
      <ErrorState onRetry={() => void deviceQuery.refetch()} />
    ) : (
      <ListSkeleton rows={6} />
    );
  }

  const device = deviceQuery.data.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{device.serialNumber}</h1>
          <p className="text-muted-foreground">
            {device.manufacturer} {device.model}
          </p>
          {device.archivedAt === null ? null : (
            <Badge variant="secondary">{t("devices.card.archived")}</Badge>
          )}
        </div>
        {device.archivedAt === null ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/devices/${device.id}/edit`}>
                <PencilIcon aria-hidden="true" />
                {t("devices.actions.edit")}
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
      <Card>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">{t("devices.columns.client")}</dt>
            <dd>
              <ClientNameLink clientId={device.clientId} />
            </dd>
            <dt className="text-muted-foreground">{t("devices.fields.manufacturer")}</dt>
            <dd>{device.manufacturer}</dd>
            <dt className="text-muted-foreground">{t("devices.fields.model")}</dt>
            <dd>{device.model}</dd>
            <dt className="text-muted-foreground">{t("devices.columns.installationDate")}</dt>
            <dd>{formatCalendarDate(device.installationDate, language)}</dd>
            <dt className="text-muted-foreground">{t("devices.card.createdAt")}</dt>
            <dd>{formatDate(device.createdAt, language)}</dd>
            {device.archivedAt === null ? null : (
              <>
                <dt className="text-muted-foreground">{t("devices.card.archivedAt")}</dt>
                <dd>{formatDate(device.archivedAt, language)}</dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>
      <section aria-labelledby="device-work-orders-heading" className="flex flex-col gap-4">
        <h2 id="device-work-orders-heading" className="text-lg font-semibold">
          {t("devices.card.workOrders")}
        </h2>
        <WorkOrderHistory filter={{ deviceId: device.id }} />
      </section>
    </div>
  );
}
