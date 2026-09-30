import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import { unwrap } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { useSessionStore } from "@/shared/session/sessionStore";

export const roles = ["Admin", "Dispatcher", "Technician"] as const;

export type Role = (typeof roles)[number];

export type CurrentUser = Omit<components["schemas"]["UserResponse"], "role"> & { role: Role };

export const sessionQueryKeys = {
  currentUser: ["session", "currentUser"] as const,
};

export function isRole(value: string): value is Role {
  return roles.some((role) => role === value);
}

export function homePathFor(role: Role): string {
  return role === "Technician" ? "/my-work-orders" : "/";
}

async function fetchCurrentUser(): Promise<CurrentUser> {
  const user = unwrap(await apiClient.GET("/api/v1/users/me"));
  const { role } = user;
  if (!isRole(role)) {
    throw new ApiError({ kind: "unexpected", detail: `Unknown role: ${role}` });
  }
  return { ...user, role };
}

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: sessionQueryKeys.currentUser,
    queryFn: fetchCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useCurrentUser(): CurrentUser | undefined {
  const isAuthenticated = useSessionStore((state) => state.status === "authenticated");
  return useQuery({ ...currentUserQueryOptions(), enabled: isAuthenticated }).data;
}
