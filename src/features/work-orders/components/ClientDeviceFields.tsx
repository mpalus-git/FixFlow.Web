import { useQuery } from "@tanstack/react-query";
import { type Control, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  clientOptionsQueryOptions,
  deviceOptionsQueryOptions,
} from "@/features/work-orders/api/selectionQueries";
import type { WorkOrderFormValues } from "@/features/work-orders/schemas/workOrderSchema";
import { FieldError } from "@/shared/ui/FieldError";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";

export type ClientDeviceFieldsProps = {
  control: Control<WorkOrderFormValues>;
};

export function ClientDeviceFields({ control }: ClientDeviceFieldsProps) {
  const { t } = useTranslation();
  const {
    field: { value: clientId, onChange: changeClient, onBlur: blurClient, ref: clientRef },
    fieldState: { error: clientFieldError },
  } = useController({ control, name: "clientId" });
  const {
    field: { value: deviceId, onChange: changeDevice, onBlur: blurDevice, ref: deviceRef },
    fieldState: { error: deviceFieldError },
  } = useController({ control, name: "deviceId" });
  const clientError = clientFieldError?.message;
  const deviceError = deviceFieldError?.message;
  const clientsQuery = useQuery(clientOptionsQueryOptions());
  const devicesQuery = useQuery(deviceOptionsQueryOptions(clientId));
  const clients = clientsQuery.data;
  const devices = clientId === "" ? undefined : devicesQuery.data;

  function clientPlaceholder() {
    if (clientsQuery.isError) {
      return t("workOrders.form.optionsError");
    }
    if (clients === undefined) {
      return t("workOrders.form.loadingOptions");
    }
    return clients.length === 0
      ? t("workOrders.form.noClients")
      : t("workOrders.form.chooseClient");
  }

  function devicePlaceholder() {
    if (clientId === "") {
      return t("workOrders.form.chooseClientFirst");
    }
    if (devicesQuery.isError) {
      return t("workOrders.form.optionsError");
    }
    if (devices === undefined) {
      return t("workOrders.form.loadingOptions");
    }
    return devices.length === 0
      ? t("workOrders.form.noDevices")
      : t("workOrders.form.chooseDevice");
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="work-order-clientId">{t("workOrders.columns.client")}</Label>
        <NativeSelect
          id="work-order-clientId"
          className="w-full"
          disabled={clients === undefined}
          aria-invalid={clientError !== undefined}
          aria-describedby="work-order-clientId-error"
          name="clientId"
          ref={clientRef}
          value={clientId}
          onBlur={blurClient}
          onChange={(event) => {
            changeClient(event.target.value);
            changeDevice("");
          }}
        >
          <NativeSelectOption value="">{clientPlaceholder()}</NativeSelectOption>
          {clients?.map((clientOption) => (
            <NativeSelectOption key={clientOption.id} value={clientOption.id}>
              {clientOption.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError id="work-order-clientId-error" message={clientError} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="work-order-deviceId">{t("workOrders.columns.device")}</Label>
        <NativeSelect
          id="work-order-deviceId"
          className="w-full"
          disabled={devices === undefined || devices.length === 0}
          aria-invalid={deviceError !== undefined}
          aria-describedby="work-order-deviceId-error"
          name="deviceId"
          ref={deviceRef}
          value={deviceId}
          onBlur={blurDevice}
          onChange={(event) => {
            changeDevice(event.target.value);
          }}
        >
          <NativeSelectOption value="">{devicePlaceholder()}</NativeSelectOption>
          {devices?.map((deviceOption) => (
            <NativeSelectOption key={deviceOption.id} value={deviceOption.id}>
              {t("workOrders.form.deviceOption", {
                serialNumber: deviceOption.serialNumber,
                manufacturer: deviceOption.manufacturer,
                model: deviceOption.model,
              })}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError id="work-order-deviceId-error" message={deviceError} />
      </div>
    </>
  );
}
