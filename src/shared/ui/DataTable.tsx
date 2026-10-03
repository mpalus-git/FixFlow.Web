import type { ColumnSort, ReactTable, RowData, TableFeatures } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export type DataTableProps<TFeatures extends TableFeatures, TData extends RowData> = {
  table: ReactTable<TFeatures, TData>;
  label: string;
  isUpdating: boolean;
  cellClassName?: (columnId: string) => string;
  sorting?: readonly ColumnSort[];
};

function ariaSortFor(
  sorting: readonly ColumnSort[] | undefined,
  columnId: string,
): "ascending" | "descending" | undefined {
  const columnSort = sorting?.find((sort) => sort.id === columnId);
  if (columnSort === undefined) {
    return undefined;
  }
  return columnSort.desc ? "descending" : "ascending";
}

function defaultCellClassName(): string {
  return "px-3";
}

export function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  label,
  isUpdating,
  cellClassName = defaultCellClassName,
  sorting,
}: DataTableProps<TFeatures, TData>) {
  return (
    <div className="overflow-hidden rounded-xl border" aria-busy={isUpdating}>
      <Table label={label} className={isUpdating ? "opacity-60 transition-opacity" : undefined}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cellClassName(header.column.id)}
                  aria-sort={ariaSortFor(sorting, header.column.id)}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} className={cellClassName(cell.column.id)}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
