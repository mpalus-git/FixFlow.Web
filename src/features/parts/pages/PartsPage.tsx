import { useQuery } from "@tanstack/react-query";
import { PackageIcon, SearchXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { partListQueryOptions, partsPageSize } from "@/features/parts/api/partQueries";
import { PartsTable } from "@/features/parts/components/PartsTable";
import { lowStockThreshold } from "@/features/parts/partStock";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { useListSearchParams } from "@/shared/lib/useListSearchParams";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";

export function PartsPage() {
  const { t } = useTranslation();
  const { page, search, setPage, setSearch } = useListSearchParams();
  const partsQuery = useQuery(partListQueryOptions({ page, search }));
  const partPage = partsQuery.data;
  useKeepPageInRange({
    page,
    pageSize: partsPageSize,
    totalCount: partPage?.totalCount,
    isPlaceholderData: partsQuery.isPlaceholderData,
    setPage,
  });

  function renderContent() {
    if (partsQuery.isError) {
      return <ErrorState onRetry={() => void partsQuery.refetch()} />;
    }
    if (partPage === undefined) {
      return <ListSkeleton />;
    }
    if (partPage.totalCount === 0) {
      return search === "" ? (
        <EmptyState
          icon={PackageIcon}
          title={t("parts.empty.title")}
          description={t("parts.empty.description")}
        />
      ) : (
        <EmptyState
          icon={SearchXIcon}
          title={t("parts.noResults.title")}
          description={t("parts.noResults.description", { search })}
        />
      );
    }
    return (
      <>
        <PartsTable parts={partPage.items} isUpdating={partsQuery.isPlaceholderData} />
        <PaginationControls
          page={page}
          pageSize={partsPageSize}
          totalCount={partPage.totalCount}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("parts.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("parts.lowStockHint", { count: lowStockThreshold })}
        </p>
      </div>
      <SearchInput
        label={t("parts.search.label")}
        placeholder={t("parts.search.placeholder")}
        value={search}
        maxLength={100}
        onSearch={setSearch}
      />
      {renderContent()}
    </div>
  );
}
