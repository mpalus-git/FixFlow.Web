import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import {
  readWorkOrderListParams,
  useWorkOrderListSearchParams,
} from "@/features/work-orders/hooks/useWorkOrderListSearchParams";

const technicianId = "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10";

describe("readWorkOrderListParams", () => {
  it("reads filters, search and sorting from the URL", () => {
    const params = readWorkOrderListParams(
      new URLSearchParams(
        `page=2&search=kocioł&status=InProgress&technician=${technicianId}&dueFrom=2026-10-01&dueTo=2026-10-07&overdue=true&sort=Priority&direction=Desc`,
      ),
    );

    expect(params).toEqual({
      page: 2,
      search: "kocioł",
      filters: {
        status: "InProgress",
        technicianId,
        dueFrom: "2026-10-01",
        dueTo: "2026-10-07",
        overdueOnly: true,
      },
      sort: { sortBy: "Priority", sortDirection: "Desc" },
    });
  });

  it("ignores values the API would reject", () => {
    const params = readWorkOrderListParams(
      new URLSearchParams(
        "status=Closed&technician=abc&dueFrom=2026-02-30&dueTo=tomorrow&overdue=1&sort=Name&direction=down",
      ),
    );

    expect(params.filters).toEqual({
      status: null,
      technicianId: null,
      dueFrom: null,
      dueTo: null,
      overdueOnly: false,
    });
    expect(params.sort).toEqual({ sortBy: "DueDate", sortDirection: "Asc" });
  });

  it("drops the end of a due date range that is before its start", () => {
    const params = readWorkOrderListParams(
      new URLSearchParams("dueFrom=2026-10-07&dueTo=2026-10-01"),
    );

    expect(params.filters.dueFrom).toBe("2026-10-07");
    expect(params.filters.dueTo).toBeNull();
  });
});

describe("useWorkOrderListSearchParams", () => {
  function renderListParams(initialEntry: string) {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
    return renderHook(() => ({ list: useWorkOrderListSearchParams(), location: useLocation() }), {
      wrapper,
    }).result;
  }

  it("goes back to the first page when a filter changes", () => {
    const result = renderListParams("/work-orders?page=3&status=New");

    act(() => {
      result.current.list.setFilters({ status: "Assigned", overdueOnly: true });
    });

    expect(result.current.location.search).toBe("?status=Assigned&overdue=true");
  });

  it("clears filters and search but keeps the sorting", () => {
    const result = renderListParams(
      `/work-orders?search=SN&status=New&technician=${technicianId}&dueFrom=2026-10-01&overdue=true&sort=Status`,
    );

    act(() => {
      result.current.list.clearFilters();
    });

    expect(result.current.location.search).toBe("?sort=Status");
  });

  it("does not write the default sorting to the URL", () => {
    const result = renderListParams("/work-orders?sort=ClientName&direction=Desc&page=2");

    act(() => {
      result.current.list.setSort({ sortBy: "DueDate", sortDirection: "Asc" });
    });

    expect(result.current.location.search).toBe("");
  });
});
