import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap, unwrapVersioned } from "@/shared/api/baseClient";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";

export const clientsPageSize = 20;

export type ClientListParams = {
  page: number;
  search: string;
};

export const clientKeys = {
  all: queryKeyRoots.clients,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (params: ClientListParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (clientId: string) => [...clientKeys.details(), clientId] as const,
};

export function clientListQueryOptions({ page, search }: ClientListParams) {
  return queryOptions({
    queryKey: clientKeys.list({ page, search }),
    queryFn: async ({ signal }) =>
      unwrap(
        await apiClient.GET("/api/v1/clients", {
          params: {
            query: {
              page,
              pageSize: clientsPageSize,
              ...(search === "" ? {} : { search }),
            },
          },
          signal,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function clientQueryOptions(clientId: string) {
  return queryOptions({
    queryKey: clientKeys.detail(clientId),
    queryFn: async ({ signal }) =>
      unwrapVersioned(
        await apiClient.GET("/api/v1/clients/{clientId}", {
          params: { path: { clientId } },
          signal,
        }),
      ),
  });
}
