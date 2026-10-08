import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { partListQueryOptions } from "@/features/parts/api/partQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";

type PartPage = components["schemas"]["PagedResponseOfPartResponse"];

async function requestListWith(search: string, outOfStockOnly = false) {
  const queries: Record<string, string>[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/parts`, ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      const partPage: PartPage = { items: [], page: 2, pageSize: 20, totalCount: 0 };
      return HttpResponse.json(partPage);
    }),
  );
  await new QueryClient().query(partListQueryOptions({ page: 2, search, outOfStockOnly }));
  return queries;
}

describe("partListQueryOptions", () => {
  it("sends the page and leaves out an empty search", async () => {
    expect(await requestListWith("")).toEqual([{ page: "2", pageSize: "20" }]);
  });

  it("searches by name or catalog number with the text from the search box", async () => {
    expect(await requestListWith("filtr")).toEqual([
      { page: "2", pageSize: "20", search: "filtr" },
    ]);
  });

  it("asks only for parts out of stock when that filter is on", async () => {
    expect(await requestListWith("", true)).toEqual([
      { page: "2", pageSize: "20", inStock: "false" },
    ]);
  });
});
