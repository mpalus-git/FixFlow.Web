import { ArchiveIcon, EllipsisIcon, PackagePlusIcon, PencilIcon } from "lucide-react";
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

type PartResponse = components["schemas"]["PartResponse"];

export type PartRowActionsProps = {
  part: PartResponse;
  onRestock: (part: PartResponse) => void;
  onArchive: (part: PartResponse) => void;
};

export function PartRowActions({ part, onRestock, onArchive }: PartRowActionsProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("parts.actions.label", { name: part.name })}
        >
          <EllipsisIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/parts/${part.id}/edit`}>
            <PencilIcon aria-hidden="true" />
            {t("parts.actions.edit")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onRestock(part);
          }}
        >
          <PackagePlusIcon aria-hidden="true" />
          {t("parts.actions.restock")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            onArchive(part);
          }}
        >
          <ArchiveIcon aria-hidden="true" />
          {t("parts.actions.archive")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
