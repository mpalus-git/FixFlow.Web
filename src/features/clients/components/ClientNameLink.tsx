import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { clientQueryOptions } from "@/features/clients/api/clientQueries";
import { Skeleton } from "@/shared/ui/skeleton";

export type ClientNameLinkProps = {
  clientId: string;
  linked?: boolean;
};

export function ClientNameLink({ clientId, linked = true }: ClientNameLinkProps) {
  const { t } = useTranslation();
  const clientQuery = useQuery(clientQueryOptions(clientId));

  if (clientQuery.isPending) {
    return <Skeleton role="status" className="h-4 w-40" aria-label={t("states.loading")} />;
  }

  const name = clientQuery.data?.data.name ?? t("clients.card.openClient");

  return linked ? (
    <Link to={`/clients/${clientId}`} className="underline-offset-4 hover:underline">
      {name}
    </Link>
  ) : (
    <span>{name}</span>
  );
}
