import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PartStock } from "@/features/parts/components/PartStock";
import type { components } from "@/shared/api/schema";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatMoney } from "@/shared/lib/money";
import { DataTable } from "@/shared/ui/DataTable";

type PartResponse = components["schemas"]["PartResponse"];

const features = tableFeatures({});

const numericColumnIds: readonly string[] = ["stockQuantity", "unitPrice"];

function cellClassName(columnId: string): string {
  return numericColumnIds.includes(columnId) ? "px-3 text-right" : "px-3";
}

const columnHelper = createColumnHelper<typeof features, PartResponse>();

export type PartsTableProps = {
  parts: PartResponse[];
  isUpdating: boolean;
};

export function PartsTable({ parts, isUpdating }: PartsTableProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          id: "name",
          header: t("parts.columns.name"),
          cell: (info) => <span className="font-medium">{info.getValue()}</span>,
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
      ]),
    [t, language],
  );
  const table = useTable({
    features,
    columns,
    data: parts,
    getRowId: (part) => part.id,
  });

  return <DataTable table={table} isUpdating={isUpdating} cellClassName={cellClassName} />;
}
