import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { partQueryOptions } from "@/features/parts/api/partQueries";
import { Skeleton } from "@/shared/ui/skeleton";

export type PartLabelProps = {
  partId: string;
};

export function PartLabel({ partId }: PartLabelProps) {
  const { t } = useTranslation();
  const partQuery = useQuery(partQueryOptions(partId));
  const part = partQuery.data?.data;

  if (partQuery.isPending) {
    return <Skeleton role="status" className="h-4 w-40" aria-label={t("states.loading")} />;
  }
  if (part === undefined) {
    return <span className="text-muted-foreground">{t("parts.unknown")}</span>;
  }

  return (
    <span className="flex flex-col">
      <span className="font-medium">{part.name}</span>
      <span className="text-muted-foreground">{part.catalogNumber}</span>
    </span>
  );
}
