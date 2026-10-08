import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useUpdateDeviceMutation } from "@/features/devices/api/deviceMutations";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import { DeviceForm } from "@/features/devices/components/DeviceForm";
import { toDeviceFormValues, toDeviceRequest } from "@/features/devices/schemas/deviceSchema";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { useVersionedResource } from "@/shared/api/useVersionedResource";
import { VersionConflictDialog } from "@/shared/ui/VersionConflictDialog";
import { PageHeader } from "@/shared/ui/PageHeader";

export function EditDevicePage() {
  const { t } = useTranslation();
  const { deviceId = "" } = useParams();
  const navigate = useNavigate();
  const {
    query: deviceQuery,
    editedVersion,
    conflictDialogProps,
    openConflict,
  } = useVersionedResource(deviceQueryOptions(deviceId));
  const updateDeviceMutation = useUpdateDeviceMutation();

  if (editedVersion === undefined) {
    return deviceQuery.isError ? (
      <ErrorState error={deviceQuery.error} onRetry={() => void deviceQuery.refetch()} />
    ) : (
      <ListSkeleton rows={4} />
    );
  }

  const device = editedVersion.data;
  const isArchived = device.archivedAt !== null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={t("devices.edit.title")}
        subject={device.serialNumber}
        description={device.serialNumber}
      />
      {isArchived ? (
        <Alert role="note">
          <AlertDescription>{t("apiErrors.deviceArchived")}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardContent>
          <DeviceForm
            key={editedVersion.etag}
            defaultValues={toDeviceFormValues(device)}
            submitLabel={t("devices.edit.submit")}
            cancelTo={`/devices/${deviceId}`}
            disabled={isArchived}
            onSubmit={async (values) => {
              await updateDeviceMutation.mutateAsync({
                deviceId,
                etag: editedVersion.etag,
                request: toDeviceRequest(values),
              });
              toast.success(t("devices.edit.saved"));
              await navigate(`/devices/${deviceId}`);
            }}
            onVersionConflict={openConflict}
          />
        </CardContent>
      </Card>
      <VersionConflictDialog {...conflictDialogProps} />
    </div>
  );
}
