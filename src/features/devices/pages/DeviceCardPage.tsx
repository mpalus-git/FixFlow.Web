import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { ClientNameLink } from "@/features/clients";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import {
  type ArchivableDevice,
  ArchiveDeviceDialog,
} from "@/features/devices/components/ArchiveDeviceDialog";
import { NewWorkOrderLink, WorkOrderHistory } from "@/features/work-orders";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatCalendarDate, formatDate } from "@/shared/lib/dateTime";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PageTitle } from "@/shared/ui/PageTitle";

export function DeviceCardPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { deviceId = "" } = useParams();
  const navigate = useNavigate();
  const deviceQuery = useQuery(deviceQueryOptions(deviceId));
  const [deviceToArchive, setDeviceToArchive] = useState<ArchivableDevice | null>(null);

  if (deviceQuery.data === undefined) {
    return deviceQuery.isError ? (
      <ErrorState error={deviceQuery.error} onRetry={() => void deviceQuery.refetch()} />
    ) : (
      <ListSkeleton rows={6} />
    );
  }

  const device = deviceQuery.data.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <PageTitle title={device.serialNumber} />
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
            <NewWorkOrderLink clientId={device.clientId} deviceId={device.id} />
            <Button variant="outline" asChild>
              <Link to={`/devices/${device.id}/edit`}>
                <PencilIcon aria-hidden="true" />
                {t("devices.actions.edit")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                setDeviceToArchive(device);
              }}
            >
              <ArchiveIcon aria-hidden="true" />
              {t("devices.actions.archive")}
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
      <ArchiveDeviceDialog
        device={deviceToArchive}
        onClose={() => {
          setDeviceToArchive(null);
        }}
        onArchived={() => void navigate(`/clients/${device.clientId}`)}
      />
    </div>
  );
}
