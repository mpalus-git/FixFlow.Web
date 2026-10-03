export const staleChunkReloadStorageKey = "fixflow.staleChunkReloadAt";

const reloadIntervalMs = 10_000;

function reloadPage(): void {
  window.location.reload();
}

export function startStaleChunkReload(reload: () => void = reloadPage) {
  const handlePreloadError = (event: Event) => {
    if (markReload(Date.now())) {
      event.preventDefault();
      reload();
    }
  };
  window.addEventListener("vite:preloadError", handlePreloadError);
  return () => {
    window.removeEventListener("vite:preloadError", handlePreloadError);
  };
}

function markReload(now: number): boolean {
  try {
    const previousReload = Number(sessionStorage.getItem(staleChunkReloadStorageKey));
    if (now - previousReload < reloadIntervalMs) {
      return false;
    }
    sessionStorage.setItem(staleChunkReloadStorageKey, String(now));
    return true;
  } catch {
    return false;
  }
}
