import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/features/clients/api/clientQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap, unwrapVersioned } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";

type ClientRequest = components["schemas"]["CreateClientRequest"];
type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];

export type UpdateClientVariables = {
  clientId: string;
  etag: string;
  request: ClientRequest;
};

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ClientRequest) =>
      unwrap(await apiClient.POST("/api/v1/clients", { body: request })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, etag, request }: UpdateClientVariables) =>
      unwrapVersioned(
        await apiClient.PUT("/api/v1/clients/{clientId}", {
          params: { path: { clientId }, header: { "If-Match": etag } },
          body: request,
        }),
      ),
    onSuccess: async (versionedClient, { clientId }) => {
      queryClient.setQueryData(clientKeys.detail(clientId), versionedClient);
      await queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

function withoutClient(clientPage: ClientPage | undefined, clientId: string) {
  if (clientPage === undefined) {
    return undefined;
  }
  const items = clientPage.items.filter((client) => client.id !== clientId);
  const removedCount = clientPage.items.length - items.length;
  return { ...clientPage, items, totalCount: clientPage.totalCount - removedCount };
}

export function useArchiveClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      await apiClient.POST("/api/v1/clients/{clientId}/archive", {
        params: { path: { clientId } },
      });
    },
    onMutate: async (clientId) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });
      const previousPages = queryClient.getQueriesData<ClientPage>({
        queryKey: clientKeys.lists(),
      });
      queryClient.setQueriesData<ClientPage>({ queryKey: clientKeys.lists() }, (clientPage) =>
        withoutClient(clientPage, clientId),
      );
      return { previousPages };
    },
    onError: (_error, _clientId, context) => {
      for (const [queryKey, clientPage] of context?.previousPages ?? []) {
        queryClient.setQueryData(queryKey, clientPage);
      }
    },
    onSettled: async (_data, _error, clientId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) }),
      ]);
    },
  });
}
