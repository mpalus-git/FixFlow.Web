import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ClientNameLink } from "@/features/clients";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import { Skeleton } from "@/shared/ui/skeleton";

export type DeviceClientNameProps = {
  deviceId: string;
  linked?: boolean;
};

export function DeviceClientName({ deviceId, linked = true }: DeviceClientNameProps) {
  const { t } = useTranslation();
  const deviceQuery = useQuery(deviceQueryOptions(deviceId));
  const clientId = deviceQuery.data?.data.clientId;

  if (clientId === undefined) {
    return deviceQuery.isPending ? (
      <Skeleton role="status" className="h-4 w-40" aria-label={t("states.loading")} />
    ) : null;
  }

  return <ClientNameLink clientId={clientId} linked={linked} />;
}
