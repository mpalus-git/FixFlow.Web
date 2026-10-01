import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import type { Role } from "@/shared/session/currentUser";

export const usersPageSize = 20;

export type UserListFilters = {
  role: Role | null;
  isActive: boolean | null;
};

export type UserListParams = {
  page: number;
  filters: UserListFilters;
};

export const userKeys = {
  all: queryKeyRoots.users,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
};

export function userListQueryOptions({ page, filters }: UserListParams) {
  return queryOptions({
    queryKey: userKeys.list({ page, filters }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/users", {
          params: {
            query: {
              page,
              pageSize: usersPageSize,
              ...(filters.role === null ? {} : { role: filters.role }),
              ...(filters.isActive === null ? {} : { isActive: filters.isActive }),
            },
          },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}
