import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useUpdateClientMutation } from "@/features/clients/api/clientMutations";
import { clientQueryOptions } from "@/features/clients/api/clientQueries";
import { ClientForm } from "@/features/clients/components/ClientForm";
import { toClientFormValues, toClientRequest } from "@/features/clients/schemas/clientSchema";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { useVersionedResource } from "@/shared/api/useVersionedResource";
import { VersionConflictDialog } from "@/shared/ui/VersionConflictDialog";
import { PageTitle } from "@/shared/ui/PageTitle";

export function EditClientPage() {
  const { t } = useTranslation();
  const { clientId = "" } = useParams();
  const navigate = useNavigate();
  const {
    query: clientQuery,
    editedVersion,
    conflictDialogProps,
    openConflict,
  } = useVersionedResource(clientQueryOptions(clientId));
  const updateClientMutation = useUpdateClientMutation();

  if (editedVersion === undefined) {
    return clientQuery.isError ? (
      <ErrorState error={clientQuery.error} onRetry={() => void clientQuery.refetch()} />
    ) : (
      <ListSkeleton rows={6} />
    );
  }

  const client = editedVersion.data;
  const isArchived = client.archivedAt !== null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle title={t("clients.edit.title")} subject={client.name} />
        <h1 className="text-2xl font-semibold tracking-tight">{t("clients.edit.title")}</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>
      {isArchived ? (
        <Alert role="note">
          <AlertDescription>{t("apiErrors.clientArchived")}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardContent>
          <ClientForm
            key={editedVersion.etag}
            defaultValues={toClientFormValues(client)}
            submitLabel={t("clients.edit.submit")}
            cancelTo={`/clients/${clientId}`}
            disabled={isArchived}
            onSubmit={async (values) => {
              await updateClientMutation.mutateAsync({
                clientId,
                etag: editedVersion.etag,
                request: toClientRequest(values),
              });
              toast.success(t("clients.edit.saved"));
              await navigate(`/clients/${clientId}`);
            }}
            onVersionConflict={openConflict}
          />
        </CardContent>
      </Card>
      <VersionConflictDialog {...conflictDialogProps} />
    </div>
  );
}
