import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useArchivePartMutation } from "@/features/parts/api/partMutations";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

type PartResponse = components["schemas"]["PartResponse"];

function describeArchiveError(error: unknown, t: TFunction): string {
  if (!(error instanceof ApiError)) {
    return t("errors.unexpected");
  }
  return error.errorCode === "Persistence.ConcurrentModification"
    ? t("parts.archive.concurrent")
    : describeApiError(error, t);
}

export type ArchivePartDialogProps = {
  part: PartResponse | null;
  onClose: () => void;
};

export function ArchivePartDialog({ part, onClose }: ArchivePartDialogProps) {
  const { t } = useTranslation();
  const archivePartMutation = useArchivePartMutation();

  function archive(partToArchive: PartResponse) {
    archivePartMutation.mutate(partToArchive.id, {
      onSuccess: () => {
        toast.success(t("parts.archive.archived", { name: partToArchive.name }));
      },
      onError: (error) => {
        toast.error(describeArchiveError(error, t));
      },
    });
  }

  return (
    <AlertDialog
      open={part !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("parts.archive.title", { name: part?.name })}</AlertDialogTitle>
          <AlertDialogDescription>{t("parts.archive.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (part !== null) {
                archive(part);
              }
            }}
          >
            {t("parts.archive.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
