import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import {
  useArchivePartMutation,
  useRestockPartMutation,
  useUpdatePartMutation,
} from "@/features/parts/api/partMutations";
import { partKeys } from "@/features/parts/api/partQueries";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createPartResponse } from "@/test/partFixtures";
import { server } from "@/test/server";

type PartPage = components["schemas"]["PagedResponseOfPartResponse"];
type UpdatePartRequest = components["schemas"]["UpdatePartRequest"];
type RestockPartRequest = components["schemas"]["RestockPartRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const part = createPartResponse();
const otherPart = createPartResponse({
  id: "1f2e3d4c-5b6a-4798-8a9b-0c1d2e3f4a5b",
  name: "Filtr powietrza",
  catalogNumber: "FLT-AC-100",
});
const partUrl = `${apiBaseUrl}/api/v1/parts/${part.id}`;
const listKey = partKeys.list({ page: 1, search: "" });

function pageOf(items: PartPage["items"]): PartPage {
  return { items, page: 1, pageSize: 20, totalCount: items.length };
}

function renderWithQueryClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(listKey, pageOf([part, otherPart]));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, result: renderHook(hook, { wrapper }).result };
}

describe("part mutations", () => {
  it("sends the edited version in If-Match and stores the new ETag", async () => {
    const request: UpdatePartRequest = { name: "Czujnik", catalogNumber: "VIE-1", unitPrice: 99 };
    const receivedIfMatch: (string | null)[] = [];
    server.use(
      http.put(partUrl, ({ request: httpRequest }) => {
        receivedIfMatch.push(httpRequest.headers.get("If-Match"));
        return HttpResponse.json({ ...part, ...request }, { headers: { ETag: '"5"' } });
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useUpdatePartMutation());

    await result.current.mutateAsync({ partId: part.id, etag: '"4"', request });

    expect(receivedIfMatch).toEqual(['"4"']);
    expect(queryClient.getQueryData(partKeys.detail(part.id))).toEqual({
      data: { ...part, ...request },
      etag: '"5"',
    });
  });

  it("shows the stock returned by the server after a delivery", async () => {
    const quantities: number[] = [];
    server.use(
      http.post<never, RestockPartRequest>(`${partUrl}/restock`, async ({ request }) => {
        quantities.push((await request.json()).quantity);
        return HttpResponse.json(
          { ...part, stockQuantity: 20 },
          {
            headers: { ETag: '"6"' },
          },
        );
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useRestockPartMutation());

    await result.current.mutateAsync({ partId: part.id, quantity: 8 });

    expect(quantities).toEqual([8]);
    expect(queryClient.getQueryData<PartPage>(listKey)?.items).toEqual([
      { ...part, stockQuantity: 20 },
      otherPart,
    ]);
  });

  it("hides an archived part at once and brings it back when archiving fails", async () => {
    const listDuringArchive: (PartPage | undefined)[] = [];
    const { queryClient, result } = renderWithQueryClient(() => useArchivePartMutation());
    server.use(
      http.post(`${partUrl}/archive`, () => {
        listDuringArchive.push(queryClient.getQueryData(listKey));
        const problem: ProblemDetails = {
          status: 409,
          title: "Conflict",
          errorCode: "Persistence.ConcurrentModification",
        };
        return HttpResponse.json(problem, { status: 409 });
      }),
    );

    await expect(result.current.mutateAsync(part.id)).rejects.toBeInstanceOf(ApiError);

    expect(listDuringArchive).toEqual([pageOf([otherPart])]);
    expect(queryClient.getQueryData(listKey)).toEqual(pageOf([part, otherPart]));
  });
});
