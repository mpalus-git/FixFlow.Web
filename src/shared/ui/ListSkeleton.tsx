import { useTranslation } from "react-i18next";
import { Skeleton } from "@/shared/ui/skeleton";

export type ListSkeletonProps = {
  rows?: number;
};

export function ListSkeleton({ rows = 5 }: ListSkeletonProps) {
  const { t } = useTranslation();

  return (
    <div role="status" aria-label={t("states.loading")} className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
