import { renderHook } from "@testing-library/react";
import { navigationPages } from "@/app/navigationPages";
import {
  preloadFallbackDelayMs,
  usePreloadNavigationPages,
} from "@/app/layout/usePreloadNavigationPages";

vi.mock("@/app/navigationPages", () => ({
  navigationPages: {
    dashboard: vi.fn(() => Promise.resolve({})),
    workOrders: vi.fn(() => Promise.resolve({})),
    myWorkOrders: vi.fn(() => Promise.resolve({})),
    dispatch: vi.fn(() => Promise.resolve({})),
    clients: vi.fn(() => Promise.resolve({})),
    devices: vi.fn(() => Promise.resolve({})),
    parts: vi.fn(() => Promise.resolve({})),
    users: vi.fn(() => Promise.resolve({})),
  },
}));

function preloadedPages() {
  return Object.entries(navigationPages)
    .filter(([, load]) => vi.mocked(load).mock.calls.length > 0)
    .map(([page]) => page);
}

describe("usePreloadNavigationPages", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("loads the dispatcher's navigation pages once the browser is idle", () => {
    let idleCallback: (() => void) | undefined;
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn((callback: () => void) => {
        idleCallback = callback;
        return 1;
      }),
    );
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback);
    const { unmount } = renderHook(() => {
      usePreloadNavigationPages("Dispatcher");
    });

    expect(preloadedPages()).toEqual([]);
    idleCallback?.();

    expect(preloadedPages()).toEqual([
      "dashboard",
      "workOrders",
      "dispatch",
      "clients",
      "devices",
      "parts",
    ]);
    unmount();
    expect(cancelIdleCallback).toHaveBeenCalledWith(1);
  });

  it("loads only the technician's page after a delay in browsers without idle callbacks", () => {
    vi.useFakeTimers();
    expect("requestIdleCallback" in globalThis).toBe(false);
    renderHook(() => {
      usePreloadNavigationPages("Technician");
    });

    vi.advanceTimersByTime(preloadFallbackDelayMs - 1);
    expect(preloadedPages()).toEqual([]);
    vi.advanceTimersByTime(1);

    expect(preloadedPages()).toEqual(["myWorkOrders"]);
  });

  it("does not load anything before the user is known", () => {
    vi.useFakeTimers();
    renderHook(() => {
      usePreloadNavigationPages(undefined);
    });

    vi.runAllTimers();

    expect(preloadedPages()).toEqual([]);
  });
});
