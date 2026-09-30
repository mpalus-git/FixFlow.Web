import { useQuery } from "@tanstack/react-query";
import { Building2Icon, SearchXIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import { clientListQueryOptions, clientsPageSize } from "@/features/clients/api/clientQueries";
import { ClientsTable } from "@/features/clients/components/ClientsTable";
import { useListSearchParams } from "@/shared/lib/useListSearchParams";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { countPages, PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";

export function ClientsPage() {
  const { t } = useTranslation();
  const { page, search, setPage, setSearch } = useListSearchParams();
  const clientsQuery = useQuery(clientListQueryOptions({ page, search }));
  const clientPage = clientsQuery.data;
  const lastPage =
    clientPage === undefined || clientsQuery.isPlaceholderData
      ? null
      : countPages(clientPage.totalCount, clientsPageSize);
  const goToPage = useEffectEvent(setPage);

  useEffect(() => {
    if (lastPage !== null && page > lastPage) {
      goToPage(lastPage);
    }
  }, [page, lastPage]);

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
        <ClientsTable clients={clientPage.items} isUpdating={clientsQuery.isPlaceholderData} />
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
      <h1 className="text-2xl font-semibold tracking-tight">{t("clients.title")}</h1>
      <SearchInput
        label={t("clients.search.label")}
        placeholder={t("clients.search.placeholder")}
        value={search}
        maxLength={100}
        onSearch={setSearch}
      />
      {renderContent()}
    </div>
  );
}
