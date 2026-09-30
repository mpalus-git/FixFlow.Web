import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { clientListQueryOptions, clientQueryOptions } from "@/features/clients/api/clientQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createClientResponse } from "@/test/clientFixtures";
import { server } from "@/test/server";

type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];

const clientsUrl = `${apiBaseUrl}/api/v1/clients`;

function captureListRequests() {
  const searchParams: URLSearchParams[] = [];
  server.use(
    http.get(clientsUrl, ({ request }) => {
      searchParams.push(new URL(request.url).searchParams);
      const clientPage: ClientPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
      return HttpResponse.json(clientPage);
    }),
  );
  return searchParams;
}

describe("clientListQueryOptions", () => {
  it("asks the API for the requested page and search text", async () => {
    const searchParams = captureListRequests();

    await new QueryClient().query(clientListQueryOptions({ page: 3, search: "piekarnia" }));

    expect(Object.fromEntries(searchParams[0] ?? [])).toEqual({
      page: "3",
      pageSize: "20",
      search: "piekarnia",
    });
  });

  it("does not send an empty search", async () => {
    const searchParams = captureListRequests();

    await new QueryClient().query(clientListQueryOptions({ page: 1, search: "" }));

    expect(searchParams[0]?.has("search")).toBe(false);
  });
});

describe("clientQueryOptions", () => {
  it("keeps the ETag together with the client", async () => {
    const client = createClientResponse();
    server.use(
      http.get(`${clientsUrl}/${client.id}`, () =>
        HttpResponse.json(client, { headers: { ETag: '"7"' } }),
      ),
    );

    const result = await new QueryClient().query(clientQueryOptions(client.id));

    expect(result).toEqual({ data: client, etag: '"7"' });
  });
});
