import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";

export type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function countPages(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

export function PaginationControls({
  page,
  pageSize,
  totalCount,
  onPageChange,
  label,
}: PaginationControlsProps) {
  const { t } = useTranslation();
  const pageCount = countPages(totalCount, pageSize);

  return (
    <nav
      aria-label={label ?? t("pagination.label")}
      className="flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-muted-foreground">{t("pagination.total", { count: totalCount })}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("pagination.previous")}
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <p aria-live="polite">{t("pagination.page", { page, pageCount })}</p>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("pagination.next")}
          disabled={page >= pageCount}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
