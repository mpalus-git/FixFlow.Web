import { MapPinIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PartLabel } from "@/features/parts";
import { partValue, signedQuantity, workMinutes } from "@/features/work-orders/serviceEntrySummary";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDate, formatDateTime, formatTime } from "@/shared/lib/dateTime";
import { formatMoney } from "@/shared/lib/money";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type ServiceEntryResponse = components["schemas"]["ServiceEntryResponse"];

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function mapUrl(latitude: number, longitude: number): string {
  const lat = String(latitude);
  const lon = String(longitude);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

export type ServiceEntryCardProps = {
  entry: ServiceEntryResponse;
  technicianLabel: string;
};

export function ServiceEntryCard({ entry, technicianLabel }: ServiceEntryCardProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const minutes = workMinutes(entry);
  const photoUrls = entry.photoUrls.filter(isHttpUrl);

  function workPeriod(startedAt: string, finishedAt: string): string {
    const finish =
      formatDate(startedAt, language) === formatDate(finishedAt, language)
        ? formatTime(finishedAt, language)
        : formatDateTime(finishedAt, language);
    return `${formatDateTime(startedAt, language)} – ${finish}`;
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {entry.isCorrection ? (
            <>
              <Badge variant="outline">{t("workOrders.serviceEntries.correction")}</Badge>
              <span>{formatDateTime(entry.createdAt, language)}</span>
            </>
          ) : null}
          {entry.workStartedAt !== null && entry.workFinishedAt !== null ? (
            <span className="font-medium">
              {workPeriod(entry.workStartedAt, entry.workFinishedAt)}
            </span>
          ) : null}
          {minutes === null ? null : (
            <span className="text-muted-foreground">
              {t("workOrders.serviceEntries.duration", {
                hours: Math.floor(minutes / 60),
                minutes: minutes % 60,
              })}
            </span>
          )}
          <span className="text-muted-foreground">{technicianLabel}</span>
        </div>
        <p className="whitespace-pre-line">{entry.note}</p>
        {entry.latitude !== null && entry.longitude !== null ? (
          <a
            href={mapUrl(entry.latitude, entry.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1 text-sm underline-offset-4 hover:underline"
          >
            <MapPinIcon aria-hidden="true" className="size-4" />
            {t("workOrders.serviceEntries.showOnMap")}
            <span className="sr-only">{t("common.opensInNewTab")}</span>
          </a>
        ) : null}
        {photoUrls.length === 0 ? null : (
          <ul aria-label={t("workOrders.serviceEntries.photos")} className="flex flex-wrap gap-2">
            {photoUrls.map((url, index) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={t("workOrders.serviceEntries.photo", { number: index + 1 })}
                    loading="lazy"
                    className="size-20 rounded-lg border object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
        {entry.parts.length === 0 ? null : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("workOrders.serviceEntries.part")}</TableHead>
                <TableHead className="text-right">
                  {t("workOrders.serviceEntries.quantity")}
                </TableHead>
                <TableHead className="text-right">
                  {t("workOrders.serviceEntries.unitPrice")}
                </TableHead>
                <TableHead className="text-right">{t("workOrders.serviceEntries.value")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.parts.map((part) => (
                <TableRow key={part.partId}>
                  <TableCell>
                    <PartLabel partId={part.partId} />
                  </TableCell>
                  <TableCell className="text-right">{signedQuantity(entry, part)}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(part.unitPrice, language)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(partValue(entry, part), language)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
