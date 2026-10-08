import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap, unwrapVersioned } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const partsPageSize = 20;

export type PartListParams = {
  page: number;
  search: string;
  outOfStockOnly: boolean;
};

export const partKeys = {
  all: queryKeyRoots.parts,
  lists: () => [...partKeys.all, "list"] as const,
  list: (params: PartListParams) => [...partKeys.lists(), params] as const,
  details: () => [...partKeys.all, "detail"] as const,
  detail: (partId: string) => [...partKeys.details(), partId] as const,
};

export function partListQueryOptions({ page, search, outOfStockOnly }: PartListParams) {
  return queryOptions({
    queryKey: partKeys.list({ page, search, outOfStockOnly }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/parts", {
          params: {
            query: {
              page,
              pageSize: partsPageSize,
              ...(search === "" ? {} : { search }),
              ...(outOfStockOnly ? { inStock: false } : {}),
            },
          },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function partQueryOptions(partId: string) {
  return queryOptions({
    queryKey: partKeys.detail(partId),
    queryFn: async ({ signal }) =>
      unwrapVersioned(
        await apiClient.GET("/api/v1/parts/{partId}", {
          params: { path: { partId } },
          signal,
        }),
      ),
  });
}
