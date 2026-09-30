import { useEffect, useEffectEvent } from "react";
import { countPages } from "@/shared/ui/PaginationControls";

type PageRange = {
  page: number;
  pageSize: number;
  totalCount: number | undefined;
  isPlaceholderData: boolean;
  setPage: (page: number) => void;
};

export function useKeepPageInRange({
  page,
  pageSize,
  totalCount,
  isPlaceholderData,
  setPage,
}: PageRange): void {
  const lastPage =
    totalCount === undefined || isPlaceholderData ? null : countPages(totalCount, pageSize);
  const goToPage = useEffectEvent(setPage);

  useEffect(() => {
    if (lastPage !== null && page > lastPage) {
      goToPage(lastPage);
    }
  }, [page, lastPage]);
}
