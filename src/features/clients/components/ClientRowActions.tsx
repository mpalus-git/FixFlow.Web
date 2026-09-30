import { ArchiveIcon, EllipsisIcon, PencilIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { components } from "@/shared/api/schema";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

type ClientResponse = components["schemas"]["ClientResponse"];

export type ClientRowActionsProps = {
  client: ClientResponse;
  onArchive: (client: ClientResponse) => void;
};

export function ClientRowActions({ client, onArchive }: ClientRowActionsProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("clients.actions.label", { name: client.name })}
        >
          <EllipsisIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/clients/${client.id}/edit`}>
            <PencilIcon aria-hidden="true" />
            {t("clients.actions.edit")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            onArchive(client);
          }}
        >
          <ArchiveIcon aria-hidden="true" />
          {t("clients.actions.archive")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
