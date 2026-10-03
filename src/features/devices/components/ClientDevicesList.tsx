import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { CpuIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  clientDeviceListQueryOptions,
  devicesPageSize,
} from "@/features/devices/api/deviceQueries";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatCalendarDate } from "@/shared/lib/dateTime";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { usePageSearchParam } from "@/shared/lib/useListSearchParams";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { DataTable } from "@/shared/ui/DataTable";

type DeviceListItem = components["schemas"]["DeviceListItemResponse"];

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, DeviceListItem>();

export type ClientDevicesListProps = {
  clientId: string;
};

export function ClientDevicesList({ clientId }: ClientDevicesListProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { page, setPage } = usePageSearchParam("devicesPage");
  const devicesQuery = useQuery(clientDeviceListQueryOptions({ clientId, page }));
  const devicePage = devicesQuery.data;
  useKeepPageInRange({
    page,
    pageSize: devicesPageSize,
    totalCount: devicePage?.totalCount,
    isPlaceholderData: devicesQuery.isPlaceholderData,
    setPage,
  });
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
        columnHelper.accessor("installationDate", {
          header: t("devices.columns.installationDate"),
          cell: (info) => formatCalendarDate(info.getValue(), language),
        }),
      ]),
    [t, language],
  );
  const table = useTable({
    features,
    columns,
    data: devicePage?.items ?? [],
    getRowId: (device) => device.id,
  });

  if (devicesQuery.isError) {
    return <ErrorState onRetry={() => void devicesQuery.refetch()} />;
  }
  if (devicePage === undefined) {
    return <ListSkeleton rows={3} />;
  }
  if (devicePage.totalCount === 0) {
    return <EmptyState icon={CpuIcon} title={t("devices.clientEmpty")} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable table={table} isUpdating={devicesQuery.isPlaceholderData} />
      <PaginationControls
        page={page}
        pageSize={devicesPageSize}
        totalCount={devicePage.totalCount}
        onPageChange={setPage}
        label={t("devices.clientPagination")}
      />
    </div>
  );
}
