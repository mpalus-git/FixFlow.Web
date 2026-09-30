import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useArchiveDeviceMutation } from "@/features/devices/api/deviceMutations";
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

export type ArchivableDevice = Pick<components["schemas"]["DeviceResponse"], "id" | "serialNumber">;

export type ArchiveDeviceDialogProps = {
  device: ArchivableDevice | null;
  onClose: () => void;
  onArchived?: () => void;
};

export function ArchiveDeviceDialog({ device, onClose, onArchived }: ArchiveDeviceDialogProps) {
  const { t } = useTranslation();
  const archiveDeviceMutation = useArchiveDeviceMutation();

  function archive(deviceToArchive: ArchivableDevice) {
    archiveDeviceMutation.mutate(deviceToArchive.id, {
      onSuccess: () => {
        toast.success(
          t("devices.archive.archived", { serialNumber: deviceToArchive.serialNumber }),
        );
        onArchived?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError ? describeApiError(error, t) : t("errors.unexpected"),
        );
      },
    });
  }

  return (
    <AlertDialog
      open={device !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("devices.archive.title", { serialNumber: device?.serialNumber })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("devices.archive.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (device !== null) {
                archive(device);
              }
            }}
          >
            {t("devices.archive.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
