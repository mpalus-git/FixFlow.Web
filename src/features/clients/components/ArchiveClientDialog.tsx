import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useArchiveClientMutation } from "@/features/clients/api/clientMutations";
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

type ClientResponse = components["schemas"]["ClientResponse"];

export type ArchiveClientDialogProps = {
  client: ClientResponse | null;
  onClose: () => void;
  onArchived?: () => void;
};

export function ArchiveClientDialog({ client, onClose, onArchived }: ArchiveClientDialogProps) {
  const { t } = useTranslation();
  const archiveClientMutation = useArchiveClientMutation();

  function archive(clientToArchive: ClientResponse) {
    archiveClientMutation.mutate(clientToArchive.id, {
      onSuccess: () => {
        toast.success(t("clients.archive.archived", { name: clientToArchive.name }));
        onArchived?.();
      },
      onError: (error) => {
        toast.error(describeApiError(error, t));
      },
    });
  }

  return (
    <AlertDialog
      open={client !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("clients.archive.title", { name: client?.name })}</AlertDialogTitle>
          <AlertDialogDescription>{t("clients.archive.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("clients.archive.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (client !== null) {
                archive(client);
              }
            }}
          >
            {t("clients.archive.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
