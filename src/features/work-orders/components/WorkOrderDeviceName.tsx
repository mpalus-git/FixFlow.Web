import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { components } from "@/shared/api/schema";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];

export type WorkOrderDeviceNameProps = {
  workOrder: Pick<WorkOrderResponse, "deviceId" | "deviceSerialNumber" | "deviceModel">;
  linked: boolean;
};

export function WorkOrderDeviceName({ workOrder, linked }: WorkOrderDeviceNameProps) {
  const { t } = useTranslation();
  const name = t("workOrders.deviceName", {
    serialNumber: workOrder.deviceSerialNumber,
    model: workOrder.deviceModel,
  });

  return linked ? (
    <Link to={`/devices/${workOrder.deviceId}`} className="underline-offset-4 hover:underline">
      {name}
    </Link>
  ) : (
    <span>{name}</span>
  );
}
