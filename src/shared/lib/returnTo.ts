export const loginPath = "/login";

export function readReturnTo(value: string | null): string | null {
  if (value === null || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value.startsWith(loginPath) ? null : value;
}

export function buildLoginPath(returnTo: string): string {
  const safeReturnTo = readReturnTo(returnTo);
  return safeReturnTo === null || safeReturnTo === "/"
    ? loginPath
    : `${loginPath}?${new URLSearchParams({ returnTo: safeReturnTo }).toString()}`;
}
