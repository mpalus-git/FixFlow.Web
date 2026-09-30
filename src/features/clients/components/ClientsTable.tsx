import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ClientRowActions } from "@/features/clients/components/ClientRowActions";
import { formatAddress } from "@/features/clients/formatAddress";
import type { components } from "@/shared/api/schema";
import { DataTable } from "@/shared/ui/DataTable";

type ClientResponse = components["schemas"]["ClientResponse"];

const features = tableFeatures({});

const actionsColumnId = "actions";

function cellClassName(columnId: string): string {
  return columnId === actionsColumnId ? "sticky right-0 bg-background px-3" : "px-3";
}
const columnHelper = createColumnHelper<typeof features, ClientResponse>();

export type ClientsTableProps = {
  clients: ClientResponse[];
  isUpdating: boolean;
  onArchive: (client: ClientResponse) => void;
};

export function ClientsTable({ clients, isUpdating, onArchive }: ClientsTableProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: t("clients.columns.name"),
          cell: ({ row }) => (
            <Link
              to={`/clients/${row.original.id}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              {row.original.name}
            </Link>
          ),
        }),
        columnHelper.accessor((client) => formatAddress(client.address), {
          id: "address",
          header: t("clients.columns.address"),
        }),
        columnHelper.accessor("contactPerson", { header: t("clients.columns.contactPerson") }),
        columnHelper.accessor("phone", {
          header: t("clients.columns.phone"),
          cell: (info) => (
            <a className="underline-offset-4 hover:underline" href={`tel:${info.getValue()}`}>
              {info.getValue()}
            </a>
          ),
        }),
        columnHelper.display({
          id: actionsColumnId,
          header: () => <span className="sr-only">{t("clients.columns.actions")}</span>,
          cell: ({ row }) => (
            <div className="flex justify-end">
              <ClientRowActions client={row.original} onArchive={onArchive} />
            </div>
          ),
        }),
      ]),
    [t, onArchive],
  );
  const table = useTable({
    features,
    columns,
    data: clients,
    getRowId: (client) => client.id,
  });

  return <DataTable table={table} isUpdating={isUpdating} cellClassName={cellClassName} />;
}
