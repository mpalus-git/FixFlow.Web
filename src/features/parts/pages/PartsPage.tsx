import { useQuery } from "@tanstack/react-query";
import { PackageCheckIcon, PackageIcon, PlusIcon, SearchXIcon } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { partListQueryOptions, partsPageSize } from "@/features/parts/api/partQueries";
import { ArchivePartDialog } from "@/features/parts/components/ArchivePartDialog";
import { PartsTable } from "@/features/parts/components/PartsTable";
import { RestockPartDialog } from "@/features/parts/components/RestockPartDialog";
import { usePartListSearchParams } from "@/features/parts/hooks/usePartListSearchParams";
import { lowStockThreshold } from "@/features/parts/partStock";
import type { components } from "@/shared/api/schema";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Label } from "@/shared/ui/label";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { SearchInput } from "@/shared/ui/SearchInput";
import { PageHeader } from "@/shared/ui/PageHeader";

type PartResponse = components["schemas"]["PartResponse"];

export function PartsPage() {
  const { t } = useTranslation();
  const { page, search, outOfStockOnly, setPage, setSearch, setOutOfStockOnly } =
    usePartListSearchParams();
  const outOfStockId = useId();
  const partsQuery = useQuery(partListQueryOptions({ page, search, outOfStockOnly }));
  const partPage = partsQuery.data;
  const [partToRestock, setPartToRestock] = useState<PartResponse | null>(null);
  const [partToArchive, setPartToArchive] = useState<PartResponse | null>(null);
  useKeepPageInRange({
    page,
    pageSize: partsPageSize,
    totalCount: partPage?.totalCount,
    isPlaceholderData: partsQuery.isPlaceholderData,
    setPage,
  });

  const addPartButton = (
    <Button asChild>
      <Link to="/parts/new">
        <PlusIcon aria-hidden="true" />
        {t("parts.create.link")}
      </Link>
    </Button>
  );

  function renderContent() {
    if (partsQuery.isError) {
      return <ErrorState error={partsQuery.error} onRetry={() => void partsQuery.refetch()} />;
    }
    if (partPage === undefined) {
      return <ListSkeleton />;
    }
    if (partPage.totalCount === 0) {
      if (search !== "") {
        return (
          <EmptyState
            icon={SearchXIcon}
            title={t("parts.noResults.title")}
            description={t("parts.noResults.description", { search })}
          />
        );
      }
      return outOfStockOnly ? (
        <EmptyState
          icon={PackageCheckIcon}
          title={t("parts.allInStock.title")}
          description={t("parts.allInStock.description")}
        />
      ) : (
        <EmptyState
          icon={PackageIcon}
          title={t("parts.empty.title")}
          description={t("parts.empty.description")}
          action={addPartButton}
        />
      );
    }
    return (
      <>
        <PartsTable
          parts={partPage.items}
          isUpdating={partsQuery.isPlaceholderData}
          onRestock={setPartToRestock}
          onArchive={setPartToArchive}
        />
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
      <PageHeader
        title={t("parts.title")}
        description={t("parts.lowStockHint", { count: lowStockThreshold })}
        actions={addPartButton}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <SearchInput
          label={t("parts.search.label")}
          placeholder={t("parts.search.placeholder")}
          value={search}
          maxLength={100}
          onSearch={setSearch}
        />
        <div className="flex items-center gap-2">
          <input
            id={outOfStockId}
            type="checkbox"
            className="size-4 accent-primary"
            checked={outOfStockOnly}
            onChange={(event) => {
              setOutOfStockOnly(event.target.checked);
            }}
          />
          <Label htmlFor={outOfStockId}>{t("parts.filters.outOfStockOnly")}</Label>
        </div>
      </div>
      {renderContent()}
      <RestockPartDialog
        part={partToRestock}
        onClose={() => {
          setPartToRestock(null);
        }}
      />
      <ArchivePartDialog
        part={partToArchive}
        onClose={() => {
          setPartToArchive(null);
        }}
      />
    </div>
  );
}
