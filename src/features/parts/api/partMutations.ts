import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { partKeys } from "@/features/parts/api/partQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrapVersioned, type Versioned } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";

type CreatePartRequest = components["schemas"]["CreatePartRequest"];
type UpdatePartRequest = components["schemas"]["UpdatePartRequest"];
type PartResponse = components["schemas"]["PartResponse"];
type PartPage = components["schemas"]["PagedResponseOfPartResponse"];

export type UpdatePartVariables = {
  partId: string;
  etag: string;
  request: UpdatePartRequest;
};

export type RestockPartVariables = {
  partId: string;
  quantity: number;
};

async function storeVersion(queryClient: QueryClient, version: Versioned<PartResponse>) {
  queryClient.setQueryData(partKeys.detail(version.data.id), version);
  await queryClient.invalidateQueries({ queryKey: partKeys.lists() });
}

export function useCreatePartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreatePartRequest) =>
      unwrapVersioned(await apiClient.POST("/api/v1/parts", { body: request })),
    onSuccess: (version) => storeVersion(queryClient, version),
  });
}

export function useUpdatePartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partId, etag, request }: UpdatePartVariables) =>
      unwrapVersioned(
        await apiClient.PUT("/api/v1/parts/{partId}", {
          params: { path: { partId }, header: { "If-Match": etag } },
          body: request,
        }),
      ),
    onSuccess: (version) => storeVersion(queryClient, version),
  });
}

export function useRestockPartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partId, quantity }: RestockPartVariables) =>
      unwrapVersioned(
        await apiClient.POST("/api/v1/parts/{partId}/restock", {
          params: { path: { partId } },
          body: { quantity },
        }),
      ),
    onSuccess: async (version) => {
      queryClient.setQueriesData<PartPage>({ queryKey: partKeys.lists() }, (partPage) =>
        partPage === undefined
          ? partPage
          : {
              ...partPage,
              items: partPage.items.map((part) =>
                part.id === version.data.id ? version.data : part,
              ),
            },
      );
      await storeVersion(queryClient, version);
    },
  });
}

function withoutPart(partPage: PartPage | undefined, partId: string) {
  if (partPage === undefined) {
    return undefined;
  }
  const items = partPage.items.filter((part) => part.id !== partId);
  const removedCount = partPage.items.length - items.length;
  return { ...partPage, items, totalCount: partPage.totalCount - removedCount };
}

export function useArchivePartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partId: string) => {
      await apiClient.POST("/api/v1/parts/{partId}/archive", {
        params: { path: { partId } },
      });
    },
    onMutate: async (partId) => {
      await queryClient.cancelQueries({ queryKey: partKeys.lists() });
      const previousPages = queryClient.getQueriesData<PartPage>({
        queryKey: partKeys.lists(),
      });
      queryClient.setQueriesData<PartPage>({ queryKey: partKeys.lists() }, (partPage) =>
        withoutPart(partPage, partId),
      );
      return { previousPages };
    },
    onError: (_error, _partId, context) => {
      for (const [queryKey, partPage] of context?.previousPages ?? []) {
        queryClient.setQueryData(queryKey, partPage);
      }
    },
    onSettled: async (_data, _error, partId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: partKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: partKeys.detail(partId) }),
      ]);
    },
  });
}
