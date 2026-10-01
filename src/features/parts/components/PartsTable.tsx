import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PartRowActions } from "@/features/parts/components/PartRowActions";
import { PartStock } from "@/features/parts/components/PartStock";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatMoney } from "@/shared/lib/money";
import { DataTable } from "@/shared/ui/DataTable";

type PartResponse = components["schemas"]["PartResponse"];

const features = tableFeatures({});

const numericColumnIds: readonly string[] = ["stockQuantity", "unitPrice"];

const actionsColumnId = "actions";

function cellClassName(columnId: string): string {
  if (columnId === actionsColumnId) {
    return "sticky right-0 bg-background px-3";
  }
  if (columnId === "catalogNumber") {
    return "hidden px-3 md:table-cell";
  }
  if (columnId === "name") {
    return "min-w-36 px-3 whitespace-normal";
  }
  return numericColumnIds.includes(columnId) ? "px-3 text-right" : "px-3";
}

const columnHelper = createColumnHelper<typeof features, PartResponse>();

export type PartsTableProps = {
  parts: PartResponse[];
  isUpdating: boolean;
  onRestock: (part: PartResponse) => void;
  onArchive: (part: PartResponse) => void;
};

export function PartsTable({ parts, isUpdating, onRestock, onArchive }: PartsTableProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          id: "name",
          header: t("parts.columns.name"),
          cell: ({ row }) => (
            <span className="flex flex-col">
              <span className="font-medium">{row.original.name}</span>
              <span className="text-muted-foreground md:hidden">{row.original.catalogNumber}</span>
            </span>
          ),
        }),
        columnHelper.accessor("catalogNumber", {
          id: "catalogNumber",
          header: t("parts.columns.catalogNumber"),
        }),
        columnHelper.accessor("stockQuantity", {
          id: "stockQuantity",
          header: t("parts.columns.stockQuantity"),
          cell: (info) => <PartStock stockQuantity={info.getValue()} />,
        }),
        columnHelper.accessor("unitPrice", {
          id: "unitPrice",
          header: t("parts.columns.unitPrice"),
          cell: (info) => (
            <span className="tabular-nums">{formatMoney(info.getValue(), language)}</span>
          ),
        }),
        columnHelper.display({
          id: actionsColumnId,
          header: () => <span className="sr-only">{t("parts.columns.actions")}</span>,
          cell: ({ row }) => (
            <div className="flex justify-end">
              <PartRowActions part={row.original} onRestock={onRestock} onArchive={onArchive} />
            </div>
          ),
        }),
      ]),
    [t, language, onRestock, onArchive],
  );
  const table = useTable({
    features,
    columns,
    data: parts,
    getRowId: (part) => part.id,
  });

  return <DataTable table={table} isUpdating={isUpdating} cellClassName={cellClassName} />;
}
