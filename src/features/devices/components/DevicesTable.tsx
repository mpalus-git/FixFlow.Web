import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { DeviceRowActions } from "@/features/devices/components/DeviceRowActions";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatCalendarDate } from "@/shared/lib/dateTime";
import { DataTable } from "@/shared/ui/DataTable";

type DeviceListItem = components["schemas"]["DeviceListItemResponse"];

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, DeviceListItem>();

const actionsColumnId = "actions";

function cellClassName(columnId: string): string {
  return columnId === actionsColumnId ? "sticky right-0 bg-background px-3" : "px-3";
}

export type DevicesTableProps = {
  devices: DeviceListItem[];
  isUpdating: boolean;
  onArchive: (device: DeviceListItem) => void;
};

export function DevicesTable({ devices, isUpdating, onArchive }: DevicesTableProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("serialNumber", {
          header: t("devices.columns.serialNumber"),
          cell: ({ row }) => (
            <Link
              to={`/devices/${row.original.id}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              {row.original.serialNumber}
            </Link>
          ),
        }),
        columnHelper.accessor((device) => `${device.manufacturer} ${device.model}`, {
          id: "model",
          header: t("devices.columns.model"),
        }),
        columnHelper.accessor("clientName", {
          header: t("devices.columns.client"),
          cell: ({ row }) => (
            <Link
              to={`/clients/${row.original.clientId}`}
              className="underline-offset-4 hover:underline"
            >
              {row.original.clientName}
            </Link>
          ),
        }),
        columnHelper.accessor("installationDate", {
          header: t("devices.columns.installationDate"),
          cell: (info) => formatCalendarDate(info.getValue(), language),
        }),
        columnHelper.display({
          id: actionsColumnId,
          header: () => <span className="sr-only">{t("devices.columns.actions")}</span>,
          cell: ({ row }) => (
            <div className="flex justify-end">
              <DeviceRowActions device={row.original} onArchive={onArchive} />
            </div>
          ),
        }),
      ]),
    [t, language, onArchive],
  );
  const table = useTable({
    features,
    columns,
    data: devices,
    getRowId: (device) => device.id,
  });

  return (
    <DataTable
      table={table}
      label={t("devices.title")}
      isUpdating={isUpdating}
      cellClassName={cellClassName}
    />
  );
}
