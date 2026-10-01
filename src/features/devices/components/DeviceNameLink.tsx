import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import { Skeleton } from "@/shared/ui/skeleton";

export type DeviceNameLinkProps = {
  deviceId: string;
  linked?: boolean;
};

export function DeviceNameLink({ deviceId, linked = true }: DeviceNameLinkProps) {
  const { t } = useTranslation();
  const deviceQuery = useQuery(deviceQueryOptions(deviceId));
  const device = deviceQuery.data?.data;

  if (deviceQuery.isPending) {
    return <Skeleton role="status" className="h-4 w-48" aria-label={t("states.loading")} />;
  }

  const name =
    device === undefined
      ? t("devices.openDevice")
      : t("devices.name", {
          serialNumber: device.serialNumber,
          manufacturer: device.manufacturer,
          model: device.model,
        });

  return linked ? (
    <Link to={`/devices/${deviceId}`} className="underline-offset-4 hover:underline">
      {name}
    </Link>
  ) : (
    <span>{name}</span>
  );
}
