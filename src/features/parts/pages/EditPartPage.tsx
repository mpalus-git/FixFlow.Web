import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useUpdatePartMutation } from "@/features/parts/api/partMutations";
import { partQueryOptions } from "@/features/parts/api/partQueries";
import { PartForm } from "@/features/parts/components/PartForm";
import { toPartFormValues, toUpdatePartRequest } from "@/features/parts/schemas/partSchema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { useVersionedResource } from "@/shared/api/useVersionedResource";
import { VersionConflictDialog } from "@/shared/ui/VersionConflictDialog";
import { PageTitle } from "@/shared/ui/PageTitle";

export function EditPartPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { partId = "" } = useParams();
  const navigate = useNavigate();
  const {
    query: partQuery,
    editedVersion,
    conflictDialogProps,
    openConflict,
  } = useVersionedResource(partQueryOptions(partId));
  const updatePartMutation = useUpdatePartMutation();

  if (editedVersion === undefined) {
    return partQuery.isError ? (
      <ErrorState error={partQuery.error} onRetry={() => void partQuery.refetch()} />
    ) : (
      <ListSkeleton rows={4} />
    );
  }

  const part = editedVersion.data;
  const isArchived = part.archivedAt !== null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle title={t("parts.edit.title")} subject={part.catalogNumber} />
        <h1 className="text-2xl font-semibold tracking-tight">{t("parts.edit.title")}</h1>
        <p className="text-muted-foreground">{part.catalogNumber}</p>
      </div>
      {isArchived ? (
        <Alert role="note">
          <AlertDescription>{t("apiErrors.partArchived")}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardContent>
          <PartForm
            key={editedVersion.etag}
            mode="edit"
            defaultValues={toPartFormValues(part, language)}
            submitLabel={t("parts.edit.submit")}
            disabled={isArchived}
            onSubmit={async (values) => {
              await updatePartMutation.mutateAsync({
                partId,
                etag: editedVersion.etag,
                request: toUpdatePartRequest(values),
              });
              toast.success(t("parts.edit.saved"));
              await navigate("/parts");
            }}
            onVersionConflict={openConflict}
          />
        </CardContent>
      </Card>
      <VersionConflictDialog {...conflictDialogProps} />
    </div>
  );
}
