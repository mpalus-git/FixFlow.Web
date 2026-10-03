import {
  createColumnHelper,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DataTable } from "@/shared/ui/DataTable";
import { SortableHeader } from "@/shared/ui/SortableHeader";

type Fruit = { name: string; price: number };

const features = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof features, Fruit>();
const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <SortableHeader
        label="Name"
        sorted={column.getIsSorted()}
        onToggle={() => {
          column.toggleSorting();
        }}
      />
    ),
  }),
  columnHelper.accessor("price", { header: "Price", enableSorting: false }),
]);

function SortableFruitTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: [{ name: "Apple", price: 3 }],
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  return <DataTable table={table} label="Fruits" isUpdating={false} sorting={sorting} />;
}

function mockResizeObserver() {
  const callbacks: (() => void)[] = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  return () => {
    act(() => {
      for (const callback of callbacks) {
        callback();
      }
    });
  };
}

function setWidths(element: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(element, "clientWidth", { configurable: true, value: clientWidth });
}

describe("DataTable", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks the sorted column header and switches the direction on each click", async () => {
    const user = userEvent.setup();
    render(<SortableFruitTable />);
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });

    expect(nameHeader).not.toHaveAttribute("aria-sort");

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("renders columns without sorting as plain headers", () => {
    render(<SortableFruitTable />);

    expect(screen.getByRole("columnheader", { name: "Price" })).not.toHaveAttribute("aria-sort");
    expect(screen.queryByRole("button", { name: "Price" })).not.toBeInTheDocument();
  });

  it("makes the table container focusable only while the table scrolls horizontally", () => {
    const notifyResize = mockResizeObserver();
    render(<SortableFruitTable />);
    const container = screen.getByRole("group", { name: "Fruits" });

    setWidths(container, 900, 360);
    notifyResize();
    expect(container).toHaveAttribute("tabindex", "0");

    setWidths(container, 900, 1280);
    notifyResize();
    expect(container).not.toHaveAttribute("tabindex");
  });
});
