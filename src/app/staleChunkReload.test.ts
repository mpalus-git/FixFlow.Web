import { startStaleChunkReload, staleChunkReloadStorageKey } from "@/app/staleChunkReload";

function dispatchPreloadError(): Event {
  const event = new Event("vite:preloadError", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe("startStaleChunkReload", () => {
  let stop: () => void = () => undefined;

  afterEach(() => {
    stop();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("reloads the page when a module from a previous deployment fails to load", () => {
    const reload = vi.fn();
    stop = startStaleChunkReload(reload);

    const event = dispatchPreloadError();

    expect(reload).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("lets the error reach the route error screen when the page was just reloaded", () => {
    const reload = vi.fn();
    stop = startStaleChunkReload(reload);
    dispatchPreloadError();

    const event = dispatchPreloadError();

    expect(reload).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(false);
  });

  it("reloads again after a later deployment", () => {
    sessionStorage.setItem(staleChunkReloadStorageKey, String(Date.now() - 60_000));
    const reload = vi.fn();
    stop = startStaleChunkReload(reload);

    dispatchPreloadError();

    expect(reload).toHaveBeenCalledOnce();
  });

  it("does not reload when session storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const reload = vi.fn();
    stop = startStaleChunkReload(reload);

    const event = dispatchPreloadError();

    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
