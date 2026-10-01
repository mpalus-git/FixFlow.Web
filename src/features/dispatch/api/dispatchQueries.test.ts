import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import {
  unassignedWorkOrdersQueryOptions,
  weekWorkOrdersQueryOptions,
} from "@/features/dispatch/api/dispatchQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

function captureListQuery() {
  const queries: Record<string, string>[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/work-orders`, ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      const workOrderPage: WorkOrderPage = { items: [], page: 1, pageSize: 100, totalCount: 0 };
      return HttpResponse.json(workOrderPage);
    }),
  );
  return queries;
}

describe("dispatch queries", () => {
  it("loads work orders due from Monday to Sunday of the week", async () => {
    const queries = captureListQuery();

    await new QueryClient().query(weekWorkOrdersQueryOptions("2026-09-28"));

    expect(queries).toEqual([
      {
        dueFrom: "2026-09-28",
        dueTo: "2026-10-04",
        page: "1",
        pageSize: "100",
        sortBy: "DueDate",
        sortDirection: "Asc",
      },
    ]);
  });

  it("loads new work orders regardless of the due date", async () => {
    const queries = captureListQuery();

    await new QueryClient().query(unassignedWorkOrdersQueryOptions());

    expect(queries).toEqual([
      { status: "New", page: "1", pageSize: "100", sortBy: "DueDate", sortDirection: "Asc" },
    ]);
  });
});
