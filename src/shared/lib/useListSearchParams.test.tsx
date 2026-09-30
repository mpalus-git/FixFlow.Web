import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { readPageParam, usePageSearchParam } from "@/shared/lib/useListSearchParams";

describe("readPageParam", () => {
  it("reads a positive page number", () => {
    expect(readPageParam("4")).toBe(4);
  });

  it.each([null, "", "0", "-2", "1.5", "abc", "99999999999999999999"])(
    "falls back to the first page for %s",
    (value) => {
      expect(readPageParam(value)).toBe(1);
    },
  );
});

describe("usePageSearchParam", () => {
  function renderTwoPages(initialEntry: string) {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
    return renderHook(
      () => ({
        devices: usePageSearchParam("devicesPage"),
        orders: usePageSearchParam("ordersPage"),
        location: useLocation(),
      }),
      { wrapper },
    ).result;
  }

  it("keeps the pages of two lists on one screen independent", () => {
    const result = renderTwoPages("/clients/1?ordersPage=3");

    act(() => {
      result.current.devices.setPage(2);
    });

    expect(result.current.devices.page).toBe(2);
    expect(result.current.orders.page).toBe(3);
    expect(result.current.location.search).toBe("?ordersPage=3&devicesPage=2");
  });

  it("removes the parameter when going back to the first page", () => {
    const result = renderTwoPages("/clients/1?devicesPage=2&ordersPage=3");

    act(() => {
      result.current.devices.setPage(1);
    });

    expect(result.current.location.search).toBe("?ordersPage=3");
  });
});
