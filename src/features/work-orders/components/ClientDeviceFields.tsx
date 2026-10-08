import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type Control, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  clientOptionsQueryOptions,
  deviceOptionsQueryOptions,
  selectedClientQueryOptions,
  selectedDeviceQueryOptions,
} from "@/features/work-orders/api/selectionQueries";
import type { WorkOrderFormValues } from "@/features/work-orders/schemas/workOrderSchema";
import { Combobox, type ComboboxOption } from "@/shared/ui/Combobox";
import { FieldError } from "@/shared/ui/FieldError";
import { Label } from "@/shared/ui/label";

type DeviceLabelFields = {
  serialNumber: string;
  manufacturer: string;
  model: string;
};

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
  const [clientSearch, setClientSearch] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [chosenClient, setChosenClient] = useState<ComboboxOption | null>(null);
  const [chosenDevice, setChosenDevice] = useState<ComboboxOption | null>(null);
  const clientsQuery = useQuery(clientOptionsQueryOptions(clientSearch));
  const devicesQuery = useQuery(deviceOptionsQueryOptions(clientId, deviceSearch));
  const isClientKnown = chosenClient?.value === clientId;
  const isDeviceKnown = chosenDevice?.value === deviceId;
  const selectedClientQuery = useQuery(selectedClientQueryOptions(clientId, !isClientKnown));
  const selectedDeviceQuery = useQuery(selectedDeviceQueryOptions(deviceId, !isDeviceKnown));

  function deviceLabel(device: DeviceLabelFields) {
    return t("workOrders.form.deviceOption", {
      serialNumber: device.serialNumber,
      manufacturer: device.manufacturer,
      model: device.model,
    });
  }

  function selectedClient(): ComboboxOption | null {
    if (clientId === "") {
      return null;
    }
    if (isClientKnown) {
      return chosenClient;
    }
    const client = selectedClientQuery.data;
    return client === undefined ? null : { value: client.id, label: client.name };
  }

  function selectedDevice(): ComboboxOption | null {
    if (deviceId === "") {
      return null;
    }
    if (isDeviceKnown) {
      return chosenDevice;
    }
    const device = selectedDeviceQuery.data;
    return device === undefined ? null : { value: device.id, label: deviceLabel(device) };
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="work-order-clientId">{t("workOrders.columns.client")}</Label>
        <Combobox
          id="work-order-clientId"
          name="clientId"
          label={t("workOrders.columns.client")}
          inputRef={clientRef}
          selected={selectedClient()}
          options={clientsQuery.data?.map((client) => ({ value: client.id, label: client.name }))}
          isError={clientsQuery.isError}
          placeholder={t("workOrders.form.searchClient")}
          loadingText={t("workOrders.form.loadingOptions")}
          emptyText={t(
            clientSearch === "" ? "workOrders.form.noClients" : "workOrders.form.noMatchingOptions",
          )}
          errorText={t("workOrders.form.optionsError")}
          invalid={clientError !== undefined}
          describedBy="work-order-clientId-error"
          onQueryChange={setClientSearch}
          onSelect={(option) => {
            setChosenClient(option);
            changeClient(option.value);
            if (option.value !== clientId) {
              changeDevice("");
            }
          }}
          onBlur={blurClient}
        />
        <FieldError id="work-order-clientId-error" message={clientError} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="work-order-deviceId">{t("workOrders.columns.device")}</Label>
        <Combobox
          id="work-order-deviceId"
          name="deviceId"
          label={t("workOrders.columns.device")}
          inputRef={deviceRef}
          selected={selectedDevice()}
          options={
            clientId === ""
              ? undefined
              : devicesQuery.data?.map((device) => ({
                  value: device.id,
                  label: deviceLabel(device),
                }))
          }
          isError={devicesQuery.isError}
          disabled={clientId === ""}
          placeholder={t(
            clientId === "" ? "workOrders.form.chooseClientFirst" : "workOrders.form.searchDevice",
          )}
          loadingText={t("workOrders.form.loadingOptions")}
          emptyText={t(
            deviceSearch === "" ? "workOrders.form.noDevices" : "workOrders.form.noMatchingOptions",
          )}
          errorText={t("workOrders.form.optionsError")}
          invalid={deviceError !== undefined}
          describedBy="work-order-deviceId-error"
          onQueryChange={setDeviceSearch}
          onSelect={(option) => {
            setChosenDevice(option);
            changeDevice(option.value);
          }}
          onBlur={blurDevice}
        />
        <FieldError id="work-order-deviceId-error" message={deviceError} />
      </div>
    </>
  );
}
