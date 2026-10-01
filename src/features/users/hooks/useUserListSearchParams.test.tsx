import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import {
  hasActiveUserFilters,
  readUserListParams,
  useUserListSearchParams,
} from "@/features/users/hooks/useUserListSearchParams";

describe("readUserListParams", () => {
  it("reads the page, role and account status from the URL", () => {
    expect(
      readUserListParams(new URLSearchParams("page=2&role=Technician&status=inactive")),
    ).toEqual({ page: 2, filters: { role: "Technician", isActive: false } });
  });

  it("ignores values the API would reject", () => {
    const params = readUserListParams(new URLSearchParams("role=Manager&status=true"));

    expect(params.filters).toEqual({ role: null, isActive: null });
    expect(hasActiveUserFilters(params)).toBe(false);
  });
});

describe("useUserListSearchParams", () => {
  function renderListParams(initialEntry: string) {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
    return renderHook(() => ({ list: useUserListSearchParams(), location: useLocation() }), {
      wrapper,
    }).result;
  }

  it("goes back to the first page when a filter changes", () => {
    const result = renderListParams("/users?page=3&role=Admin");

    act(() => {
      result.current.list.setFilters({ role: "Dispatcher", isActive: true });
    });

    expect(result.current.location.search).toBe("?role=Dispatcher&status=active");
  });

  it("clears both filters", () => {
    const result = renderListParams("/users?role=Technician&status=inactive&page=2");

    act(() => {
      result.current.list.clearFilters();
    });

    expect(result.current.location.search).toBe("");
  });
});
