import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { clientQueryOptions } from "@/features/clients/api/clientQueries";
import { ArchiveClientDialog } from "@/features/clients/components/ArchiveClientDialog";
import { formatAddress } from "@/shared/lib/formatAddress";
import { ClientDevicesList } from "@/features/devices";
import { WorkOrderHistory } from "@/features/work-orders";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatDate } from "@/shared/lib/dateTime";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PageTitle } from "@/shared/ui/PageTitle";

type ClientResponse = components["schemas"]["ClientResponse"];

export function ClientCardPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const { clientId = "" } = useParams();
  const clientQuery = useQuery(clientQueryOptions(clientId));
  const [clientToArchive, setClientToArchive] = useState<ClientResponse | null>(null);

  if (clientQuery.data === undefined) {
    return clientQuery.isError ? (
      <ErrorState error={clientQuery.error} onRetry={() => void clientQuery.refetch()} />
    ) : (
      <ListSkeleton rows={6} />
    );
  }

  const client = clientQuery.data.data;
  const isArchived = client.archivedAt !== null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <PageTitle title={client.name} />
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          {isArchived ? <Badge variant="secondary">{t("clients.card.archived")}</Badge> : null}
        </div>
        {isArchived ? null : (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/clients/${client.id}/edit`}>
                <PencilIcon aria-hidden="true" />
                {t("clients.actions.edit")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                setClientToArchive(client);
              }}
            >
              <ArchiveIcon aria-hidden="true" />
              {t("clients.actions.archive")}
            </Button>
          </div>
        )}
      </div>
      <Card>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">{t("clients.fields.address")}</dt>
            <dd>{formatAddress(client.address)}</dd>
            <dt className="text-muted-foreground">{t("clients.fields.contactPerson")}</dt>
            <dd>{client.contactPerson}</dd>
            <dt className="text-muted-foreground">{t("clients.fields.phone")}</dt>
            <dd>
              <a className="underline-offset-4 hover:underline" href={`tel:${client.phone}`}>
                {client.phone}
              </a>
            </dd>
            <dt className="text-muted-foreground">{t("clients.card.email")}</dt>
            <dd className="break-all">
              {client.email === null ? (
                <span className="text-muted-foreground">{t("clients.card.noEmail")}</span>
              ) : (
                <a className="underline-offset-4 hover:underline" href={`mailto:${client.email}`}>
                  {client.email}
                </a>
              )}
            </dd>
            <dt className="text-muted-foreground">{t("clients.card.createdAt")}</dt>
            <dd>{formatDate(client.createdAt, language)}</dd>
            {client.archivedAt === null ? null : (
              <>
                <dt className="text-muted-foreground">{t("clients.card.archivedAt")}</dt>
                <dd>{formatDate(client.archivedAt, language)}</dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>
      <section aria-labelledby="client-devices-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="client-devices-heading" className="text-lg font-semibold">
            {t("clients.card.devices")}
          </h2>
          {isArchived ? null : (
            <Button variant="outline" asChild>
              <Link to={`/clients/${client.id}/devices/new`}>
                <PlusIcon aria-hidden="true" />
                {t("clients.card.addDevice")}
              </Link>
            </Button>
          )}
        </div>
        {isArchived ? (
          <Alert role="note">
            <AlertDescription>{t("clients.card.archivedDevices")}</AlertDescription>
          </Alert>
        ) : (
          <ClientDevicesList clientId={client.id} />
        )}
      </section>
      <section aria-labelledby="client-work-orders-heading" className="flex flex-col gap-4">
        <h2 id="client-work-orders-heading" className="text-lg font-semibold">
          {t("clients.card.workOrders")}
        </h2>
        <WorkOrderHistory filter={{ clientId: client.id }} />
      </section>
      <ArchiveClientDialog
        client={clientToArchive}
        onClose={() => {
          setClientToArchive(null);
        }}
        onArchived={() => void navigate("/clients")}
      />
    </div>
  );
}
