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

type DeviceListItem = components["schemas"]["DeviceListItemResponse"];

export type DeviceRowActionsProps = {
  device: DeviceListItem;
  onArchive: (device: DeviceListItem) => void;
};

export function DeviceRowActions({ device, onArchive }: DeviceRowActionsProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("devices.actions.label", { serialNumber: device.serialNumber })}
        >
          <EllipsisIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/devices/${device.id}/edit`}>
            <PencilIcon aria-hidden="true" />
            {t("devices.actions.edit")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            onArchive(device);
          }}
        >
          <ArchiveIcon aria-hidden="true" />
          {t("devices.actions.archive")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
