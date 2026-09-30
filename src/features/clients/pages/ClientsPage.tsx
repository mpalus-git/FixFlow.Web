import { useQuery } from "@tanstack/react-query";
import { Building2Icon, PlusIcon, SearchXIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { clientListQueryOptions, clientsPageSize } from "@/features/clients/api/clientQueries";
import { ArchiveClientDialog } from "@/features/clients/components/ArchiveClientDialog";
import { ClientsTable } from "@/features/clients/components/ClientsTable";
import type { components } from "@/shared/api/schema";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { useListSearchParams } from "@/shared/lib/useListSearchParams";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";

type ClientResponse = components["schemas"]["ClientResponse"];

export function ClientsPage() {
  const { t } = useTranslation();
  const { page, search, setPage, setSearch } = useListSearchParams();
  const clientsQuery = useQuery(clientListQueryOptions({ page, search }));
  const [clientToArchive, setClientToArchive] = useState<ClientResponse | null>(null);
  const clientPage = clientsQuery.data;
  useKeepPageInRange({
    page,
    pageSize: clientsPageSize,
    totalCount: clientPage?.totalCount,
    isPlaceholderData: clientsQuery.isPlaceholderData,
    setPage,
  });

  const addClientButton = (
    <Button asChild>
      <Link to="/clients/new">
        <PlusIcon aria-hidden="true" />
        {t("clients.create.link")}
      </Link>
    </Button>
  );

  function renderContent() {
    if (clientsQuery.isError) {
      return <ErrorState onRetry={() => void clientsQuery.refetch()} />;
    }
    if (clientPage === undefined) {
      return <ListSkeleton />;
    }
    if (clientPage.totalCount === 0) {
      return search === "" ? (
        <EmptyState
          icon={Building2Icon}
          title={t("clients.empty.title")}
          description={t("clients.empty.description")}
          action={addClientButton}
        />
      ) : (
        <EmptyState
          icon={SearchXIcon}
          title={t("clients.noResults.title")}
          description={t("clients.noResults.description", { search })}
        />
      );
    }
    return (
      <>
        <ClientsTable
          clients={clientPage.items}
          isUpdating={clientsQuery.isPlaceholderData}
          onArchive={setClientToArchive}
        />
        <PaginationControls
          page={page}
          pageSize={clientsPageSize}
          totalCount={clientPage.totalCount}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t("clients.title")}</h1>
        {addClientButton}
      </div>
      <SearchInput
        label={t("clients.search.label")}
        placeholder={t("clients.search.placeholder")}
        value={search}
        maxLength={100}
        onSearch={setSearch}
      />
      {renderContent()}
      <ArchiveClientDialog
        client={clientToArchive}
        onClose={() => {
          setClientToArchive(null);
        }}
      />
    </div>
  );
}
