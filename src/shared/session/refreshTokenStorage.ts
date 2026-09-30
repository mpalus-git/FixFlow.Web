import { readStorage, removeStorage, writeStorage } from "@/shared/lib/storage";

export const refreshTokenStorageKey = "fixflow.refreshToken";

let tabOnlyRefreshToken: string | null = null;

export function readRefreshToken(): string | null {
  return readStorage(refreshTokenStorageKey) ?? tabOnlyRefreshToken;
}

export function writeRefreshToken(refreshToken: string): void {
  const isStored = writeStorage(refreshTokenStorageKey, refreshToken);
  tabOnlyRefreshToken = isStored ? null : refreshToken;
}

export function clearRefreshToken(): void {
  removeStorage(refreshTokenStorageKey);
  tabOnlyRefreshToken = null;
}
