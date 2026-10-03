export const loginPath = "/login";

export function readReturnTo(value: string | null): string | null {
  if (!value?.startsWith("/")) {
    return null;
  }
  const { origin } = window.location;
  const url = parseUrl(value, origin);
  if (url?.origin !== origin || url.pathname === loginPath) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

function parseUrl(value: string, base: string): URL | null {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

export function buildLoginPath(returnTo: string): string {
  const safeReturnTo = readReturnTo(returnTo);
  return safeReturnTo === null || safeReturnTo === "/"
    ? loginPath
    : `${loginPath}?${new URLSearchParams({ returnTo: safeReturnTo }).toString()}`;
}
