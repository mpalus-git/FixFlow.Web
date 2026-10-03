import { useQuery } from "@tanstack/react-query";
import { CpuIcon, SearchXIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { deviceListPageSize, deviceListQueryOptions } from "@/features/devices/api/deviceQueries";
import {
  type ArchivableDevice,
  ArchiveDeviceDialog,
} from "@/features/devices/components/ArchiveDeviceDialog";
import { DevicesTable } from "@/features/devices/components/DevicesTable";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { useListSearchParams } from "@/shared/lib/useListSearchParams";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";
import { PageTitle } from "@/shared/ui/PageTitle";

export function DevicesPage() {
  const { t } = useTranslation();
  const { page, search, setPage, setSearch } = useListSearchParams();
  const devicesQuery = useQuery(deviceListQueryOptions({ page, search }));
  const [deviceToArchive, setDeviceToArchive] = useState<ArchivableDevice | null>(null);
  const devicePage = devicesQuery.data;
  useKeepPageInRange({
    page,
    pageSize: deviceListPageSize,
    totalCount: devicePage?.totalCount,
    isPlaceholderData: devicesQuery.isPlaceholderData,
    setPage,
  });

  function renderContent() {
    if (devicesQuery.isError) {
      return <ErrorState error={devicesQuery.error} onRetry={() => void devicesQuery.refetch()} />;
    }
    if (devicePage === undefined) {
      return <ListSkeleton />;
    }
    if (devicePage.totalCount === 0) {
      return search === "" ? (
        <EmptyState
          icon={CpuIcon}
          title={t("devices.empty.title")}
          description={t("devices.empty.description")}
          action={
            <Button variant="outline" asChild>
              <Link to="/clients">{t("devices.empty.goToClients")}</Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={SearchXIcon}
          title={t("devices.noResults.title")}
          description={t("devices.noResults.description", { search })}
        />
      );
    }
    return (
      <>
        <DevicesTable
          devices={devicePage.items}
          isUpdating={devicesQuery.isPlaceholderData}
          onArchive={setDeviceToArchive}
        />
        <PaginationControls
          page={page}
          pageSize={deviceListPageSize}
          totalCount={devicePage.totalCount}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={t("devices.title")} />
      <h1 className="text-2xl font-semibold tracking-tight">{t("devices.title")}</h1>
      <SearchInput
        label={t("devices.search.label")}
        placeholder={t("devices.search.placeholder")}
        value={search}
        maxLength={100}
        onSearch={setSearch}
      />
      {renderContent()}
      <ArchiveDeviceDialog
        device={deviceToArchive}
        onClose={() => {
          setDeviceToArchive(null);
        }}
      />
    </div>
  );
}
