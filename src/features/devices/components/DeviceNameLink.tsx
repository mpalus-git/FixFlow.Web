import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import { Skeleton } from "@/shared/ui/skeleton";

export type DeviceNameLinkProps = {
  deviceId: string;
};

export function DeviceNameLink({ deviceId }: DeviceNameLinkProps) {
  const { t } = useTranslation();
  const deviceQuery = useQuery(deviceQueryOptions(deviceId));
  const device = deviceQuery.data?.data;

  if (deviceQuery.isPending) {
    return <Skeleton role="status" className="h-4 w-48" aria-label={t("states.loading")} />;
  }

  return (
    <Link to={`/devices/${deviceId}`} className="underline-offset-4 hover:underline">
      {device === undefined
        ? t("devices.openDevice")
        : t("devices.name", {
            serialNumber: device.serialNumber,
            manufacturer: device.manufacturer,
            model: device.model,
          })}
    </Link>
  );
}
