import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import {
  useArchiveClientMutation,
  useUpdateClientMutation,
} from "@/features/clients/api/clientMutations";
import { clientKeys } from "@/features/clients/api/clientQueries";
import { toClientFormValues, toClientRequest } from "@/features/clients/schemas/clientSchema";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createClientResponse } from "@/test/clientFixtures";
import { server } from "@/test/server";

type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];
type ClientRequest = components["schemas"]["UpdateClientRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const client = createClientResponse();
const otherClient = createClientResponse({
  id: "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
  name: "Zakład Stolarski Nowak",
});
const clientUrl = `${apiBaseUrl}/api/v1/clients/${client.id}`;
const listKey = clientKeys.list({ page: 1, search: "" });

function renderWithQueryClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, result: renderHook(hook, { wrapper }).result };
}

describe("useUpdateClientMutation", () => {
  it("sends the edited version in If-Match and stores the new ETag", async () => {
    const request: ClientRequest = toClientRequest({
      ...toClientFormValues(client),
      name: "Piekarnia Kowalski i Syn",
    });
    const receivedIfMatch: (string | null)[] = [];
    const receivedBodies: ClientRequest[] = [];
    server.use(
      http.put<never, ClientRequest>(clientUrl, async ({ request: httpRequest }) => {
        receivedIfMatch.push(httpRequest.headers.get("If-Match"));
        receivedBodies.push(await httpRequest.json());
        return HttpResponse.json(
          { ...client, name: "Piekarnia Kowalski i Syn" },
          { headers: { ETag: '"8"' } },
        );
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useUpdateClientMutation());

    await result.current.mutateAsync({ clientId: client.id, etag: '"7"', request });

    expect(receivedIfMatch).toEqual(['"7"']);
    expect(receivedBodies).toEqual([request]);
    expect(queryClient.getQueryData(clientKeys.detail(client.id))).toEqual({
      data: { ...client, name: "Piekarnia Kowalski i Syn" },
      etag: '"8"',
    });
  });
});

describe("useArchiveClientMutation", () => {
  const cachedPage: ClientPage = {
    items: [client, otherClient],
    page: 1,
    pageSize: 20,
    totalCount: 2,
  };

  it("removes the client from the cached list before the API answers", async () => {
    let answerArchive: () => void = () => undefined;
    server.use(
      http.post(
        `${clientUrl}/archive`,
        () =>
          new Promise<Response>((resolve) => {
            answerArchive = () => {
              resolve(new HttpResponse(null, { status: 204 }));
            };
          }),
      ),
    );
    const { queryClient, result } = renderWithQueryClient(() => useArchiveClientMutation());
    queryClient.setQueryData(listKey, cachedPage);

    const archiving = result.current.mutateAsync(client.id);

    await vi.waitFor(() => {
      expect(queryClient.getQueryData(listKey)).toEqual({
        ...cachedPage,
        items: [otherClient],
        totalCount: 1,
      });
    });
    answerArchive();
    await archiving;
  });

  it("restores the list when the API rejects the archiving", async () => {
    const problem: ProblemDetails = { status: 409, title: "Conflict" };
    server.use(
      http.post(`${clientUrl}/archive`, () => HttpResponse.json(problem, { status: 409 })),
    );
    const { queryClient, result } = renderWithQueryClient(() => useArchiveClientMutation());
    queryClient.setQueryData(listKey, cachedPage);

    await expect(result.current.mutateAsync(client.id)).rejects.toMatchObject({
      kind: "conflict",
    });

    expect(queryClient.getQueryData(listKey)).toEqual(cachedPage);
  });
});
