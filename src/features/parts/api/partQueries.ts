import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrapVersioned } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const partKeys = {
  all: queryKeyRoots.parts,
  details: () => [...partKeys.all, "detail"] as const,
  detail: (partId: string) => [...partKeys.details(), partId] as const,
};

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
