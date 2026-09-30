import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { VersionConflictDialog } from "@/shared/ui/VersionConflictDialog";

export function EditDevicePage() {
  const { t } = useTranslation();
  const { deviceId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deviceQuery = useQuery(deviceQueryOptions(deviceId));
  const updateDeviceMutation = useUpdateDeviceMutation();
  const [loadedVersion, setLoadedVersion] = useState(deviceQuery.data);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const editedVersion = loadedVersion ?? deviceQuery.data;

  if (editedVersion === undefined) {
    return deviceQuery.isError ? (
      <ErrorState onRetry={() => void deviceQuery.refetch()} />
    ) : (
      <ListSkeleton rows={4} />
    );
  }

  async function loadCurrentVersion() {
    try {
      setLoadedVersion(await queryClient.query({ ...deviceQueryOptions(deviceId), staleTime: 0 }));
    } catch {
      toast.error(t("states.errorTitle"));
    }
  }

  const device = editedVersion.data;
  const isArchived = device.archivedAt !== null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("devices.edit.title")}</h1>
        <p className="text-muted-foreground">{device.serialNumber}</p>
      </div>
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
            onVersionConflict={() => {
              setIsConflictOpen(true);
            }}
          />
        </CardContent>
      </Card>
      <VersionConflictDialog
        open={isConflictOpen}
        onOpenChange={setIsConflictOpen}
        onReload={() => void loadCurrentVersion()}
      />
    </div>
  );
}
