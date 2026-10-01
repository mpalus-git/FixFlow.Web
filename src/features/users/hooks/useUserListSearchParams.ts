import type { UserListFilters, UserListParams } from "@/features/users/api/userQueries";
import { isRole } from "@/shared/session/currentUser";
import { pageValue, readPageParam, useSearchParamsUpdate } from "@/shared/lib/useListSearchParams";

const statusValues = { active: true, inactive: false } as const;

function readStatus(value: string | null): boolean | null {
  if (value === "active" || value === "inactive") {
    return statusValues[value];
  }
  return null;
}

function statusValue(isActive: boolean | null): string | null {
  if (isActive === null) {
    return null;
  }
  return isActive ? "active" : "inactive";
}

export function readUserListParams(searchParams: URLSearchParams): UserListParams {
  const role = searchParams.get("role");

  return {
    page: readPageParam(searchParams.get("page")),
    filters: {
      role: role !== null && isRole(role) ? role : null,
      isActive: readStatus(searchParams.get("status")),
    },
  };
}

export function hasActiveUserFilters({ filters }: UserListParams): boolean {
  return filters.role !== null || filters.isActive !== null;
}

function filterValues(filters: Partial<UserListFilters>): Record<string, string | null> {
  const values: Record<string, string | null> = {};
  if (filters.role !== undefined) {
    values.role = filters.role;
  }
  if (filters.isActive !== undefined) {
    values.status = statusValue(filters.isActive);
  }
  return values;
}

export function useUserListSearchParams() {
  const [searchParams, update] = useSearchParamsUpdate();

  return {
    ...readUserListParams(searchParams),
    setPage: (page: number) => {
      update({ page: pageValue(page) });
    },
    setFilters: (filters: Partial<UserListFilters>) => {
      update({ ...filterValues(filters), page: null });
    },
    clearFilters: () => {
      update({ role: null, status: null, page: null });
    },
  };
}
